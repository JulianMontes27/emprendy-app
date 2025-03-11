import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  Plus,
  FileText,
  Mail,
  Eye,
  MessageSquare,
  Calendar,
  ArrowRight,
  Zap,
  ChevronRight,
  BarChart3,
  ListFilter,
  Loader2,
  Share2,
  Target,
  AlertCircle,
} from "lucide-react";
import { DashboardMetrics } from "./_components/content";
import getSession from "@/lib/get-session";
import { db } from "@/db";

import { campaigns, campaignsToLists, contacts, emailClicks, emailMessages, emailOpens, emailTemplates, lists } from "@/db/schema";
import { eq, count, desc, and, gte, lte, isNull, not } from "drizzle-orm";
import { subDays, format } from "date-fns";
import { es } from "date-fns/locale";

// Types for our data
type Campaign = {
  id: string;
  name: string;
  status: string;
  sentAt: Date | null;
  totalSent: number;
  openRate: number;
  replyRate: number;
};

type ContactStats = {
  total: number;
  newCount: number;
  listCount: number;
  responseRate: number;
};

type MetricStat = {
  value: number;
  change: number;
  trend: "up" | "down" | "neutral";
};

type NextCampaign = {
  id: string;
  name: string;
  scheduledAt: Date;
  contactCount: number;
};

type ScheduledCampaign = {
  id: string;
  name: string;
  scheduledAt: Date;
  recipients: number;
  template: string;
  lists: string[];
};

/* Pre-rendered in the server at REQUEST time, since we need the client's personal (dynamic) data to render the HTML page in the server */
export default async function DashboardPage() {
  const session = await getSession();
  const user = session?.user;
  if (!user || user === undefined) return null;

  // Data fetching functions
  async function getRecentCampaigns(): Promise<Campaign[]> {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const campaignData = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        sentAt: campaigns.sentAt,
      })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.createdById, user.id),
          gte(campaigns.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(campaigns.createdAt))
      .limit(4);

    // Get metrics for each campaign
    const enrichedCampaigns = await Promise.all(
      campaignData.map(async (campaign: any) => {
        const sentCount = await db
          .select({ count: count() })
          .from(emailMessages)
          .where(eq(emailMessages.campaignId, campaign.id))
          .execute()
          .then((result: any) => result[0]?.count || 0);

        const openCount = await db
          .select({ count: count() })
          .from(emailMessages)
          .leftJoin(emailOpens, eq(emailOpens.messageId, emailMessages.id))
          .where(
            and(
              eq(emailMessages.campaignId, campaign.id),
              not(isNull(emailMessages.openedAt))
            )
          )
          .execute()
          .then((result) => result[0]?.count || 0);

        const replyCount = await db
          .select({ count: count() })
          .from(emailMessages)
          .where(
            and(
              eq(emailMessages.campaignId, campaign.id),
              not(isNull(emailMessages.clickedAt))
            )
          )
          .execute()
          .then((result) => result[0]?.count || 0);

        const openRate = sentCount > 0 ? (openCount / sentCount) * 100 : 0;
        const replyRate = sentCount > 0 ? (replyCount / sentCount) * 100 : 0;

        return {
          ...campaign,
          totalSent: sentCount,
          openRate,
          replyRate,
        };
      })
    );

    return enrichedCampaigns;
  }

  async function getContactStats(): Promise<ContactStats> {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const totalContacts = await db
      .select({ count: count() })
      .from(contacts)
      .where(eq(contacts.userId, user.id))
      .execute()
      .then((result) => result[0]?.count || 0);

    const newContacts = await db
      .select({ count: count() })
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, user.id),
          gte(contacts.createdAt, thirtyDaysAgo)
        )
      )
      .execute()
      .then((result) => result[0]?.count || 0);

    const listCount = await db
      .select({ count: count() })
      .from(lists)
      .where(eq(lists.createdById, user.id))
      .execute()
      .then((result) => result[0]?.count || 0);

    // Calculate response rate from all campaigns
    const messageCount = await db
      .select({ count: count() })
      .from(emailMessages)
      .innerJoin(campaigns, eq(emailMessages.campaignId, campaigns.id))
      .where(eq(campaigns.createdById, user.id))
      .execute()
      .then((result) => result[0]?.count || 0);

    const responseCount = await db
      .select({ count: count() })
      .from(emailMessages)
      .innerJoin(campaigns, eq(emailMessages.campaignId, campaigns.id))
      .where(
        and(
          eq(campaigns.createdById, user.id),
          not(isNull(emailMessages.clickedAt))
        )
      )
      .execute()
      .then((result) => result[0]?.count || 0);

    const responseRate =
      messageCount > 0 ? (responseCount / messageCount) * 100 : 0;

    return {
      total: totalContacts,
      newCount: newContacts,
      listCount,
      responseRate,
    };
  }

  async function getNextCampaign(): Promise<NextCampaign | null> {
    const now = new Date();

    const nextCampaignData = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        scheduledAt: campaigns.scheduledAt,
      })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.createdById, user.id),
          eq(campaigns.status, "programada"),
          gte(campaigns.scheduledAt, now)
        )
      )
      .orderBy(campaigns.scheduledAt)
      .limit(1)
      .execute();

    if (nextCampaignData.length === 0) return null;

    const campaign = nextCampaignData[0];

    // Get contact count for this campaign
    const contactCount = await db
      .select({ count: count() })
      .from(emailMessages)
      .where(eq(emailMessages.campaignId, campaign.id))
      .execute()
      .then((result) => result[0]?.count || 0);

    return {
      id: campaign.id,
      name: campaign.name,
      scheduledAt: campaign.scheduledAt!,
      contactCount,
    };
  }

  async function getScheduledCampaigns(): Promise<ScheduledCampaign[]> {
    const now = new Date();

    const scheduledCampaignsData = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        scheduledAt: campaigns.scheduledAt,
        templateId: campaigns.templateId,
      })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.createdById, user.id),
          eq(campaigns.status, "programada"),
          gte(campaigns.scheduledAt, now)
        )
      )
      .orderBy(campaigns.scheduledAt)
      .limit(3)
      .execute();

    const enrichedCampaigns = await Promise.all(
      scheduledCampaignsData.map(async (campaign) => {
        // Get template name
        const templateData = await db
          .select({ name: emailTemplates.name })
          .from(emailTemplates)
          .where(eq(emailTemplates.id, campaign.templateId))
          .execute();

        const templateName = templateData[0]?.name || "Plantilla sin nombre";

        // Get recipients count
        const recipientsCount = await db
          .select({ count: count() })
          .from(emailMessages)
          .where(eq(emailMessages.campaignId, campaign.id))
          .execute()
          .then((result) => result[0]?.count || 0);

        // Get list names
        const listsData = await db
          .select({ name: lists.name })
          .from(lists)
          .innerJoin(campaignsToLists, eq(campaignsToLists.listId, lists.id))
          .where(eq(campaignsToLists.campaignId, campaign.id))
          .execute();

        const listNames = listsData.map((list) => list.name);

        return {
          id: campaign.id,
          name: campaign.name,
          scheduledAt: campaign.scheduledAt!,
          recipients: recipientsCount,
          template: templateName,
          lists: listNames,
        };
      })
    );

    return enrichedCampaigns;
  }

  async function getPerformanceMetrics(): Promise<{
    openRate: MetricStat;
    clickRate: MetricStat;
    responseRate: MetricStat;
  }> {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const sixtyDaysAgo = subDays(new Date(), 60);

    // Current period metrics
    const currentPeriodMetrics = await db
      .select({
        totalMessages: count(emailMessages.id),
        openedMessages: count(emailOpens.id),
        clickedMessages: count(emailClicks.id),
      })
      .from(emailMessages)
      .leftJoin(campaigns, eq(emailMessages.campaignId, campaigns.id))
      .leftJoin(emailOpens, eq(emailOpens.messageId, emailMessages.id))
      .leftJoin(emailClicks, eq(emailClicks.messageId, emailMessages.id))
      .where(
        and(
          eq(campaigns.createdById, user.id),
          gte(emailMessages.sentAt, thirtyDaysAgo),
          lte(emailMessages.sentAt, new Date())
        )
      )
      .execute();

    // Previous period metrics
    const previousPeriodMetrics = await db
      .select({
        totalMessages: count(emailMessages.id),
        openedMessages: count(emailOpens.id),
        clickedMessages: count(emailClicks.id),
      })
      .from(emailMessages)
      .leftJoin(campaigns, eq(emailMessages.campaignId, campaigns.id))
      .leftJoin(emailOpens, eq(emailOpens.messageId, emailMessages.id))
      .leftJoin(emailClicks, eq(emailClicks.messageId, emailMessages.id))
      .where(
        and(
          eq(campaigns.createdById, user.id),
          gte(emailMessages.sentAt, sixtyDaysAgo),
          lte(emailMessages.sentAt, thirtyDaysAgo)
        )
      )
      .execute();

    const current = currentPeriodMetrics[0];
    const previous = previousPeriodMetrics[0];

    // Calculate rates
    const currentOpenRate =
      current.totalMessages > 0
        ? (current.openedMessages / current.totalMessages) * 100
        : 0;

    const previousOpenRate =
      previous.totalMessages > 0
        ? (previous.openedMessages / previous.totalMessages) * 100
        : 0;

    const openRateChange =
      previousOpenRate > 0
        ? ((currentOpenRate - previousOpenRate) / previousOpenRate) * 100
        : 0;

    const currentClickRate =
      current.totalMessages > 0
        ? (current.clickedMessages / current.totalMessages) * 100
        : 0;

    const previousClickRate =
      previous.totalMessages > 0
        ? (previous.clickedMessages / previous.totalMessages) * 100
        : 0;

    const clickRateChange =
      previousClickRate > 0
        ? ((currentClickRate - previousClickRate) / previousClickRate) * 100
        : 0;

    // Calculate response rate (using clicks as proxy)
    const responseRate = currentClickRate;
    const previousResponseRate = previousClickRate;
    const responseRateChange =
      previousResponseRate > 0
        ? ((responseRate - previousResponseRate) / previousResponseRate) * 100
        : 0;

    return {
      openRate: {
        value: Number.parseFloat(currentOpenRate.toFixed(1)),
        change: Number.parseFloat(openRateChange.toFixed(1)),
        trend: openRateChange >= 0 ? "up" : "down",
      },
      clickRate: {
        value: Number.parseFloat(currentClickRate.toFixed(1)),
        change: Number.parseFloat(clickRateChange.toFixed(1)),
        trend: clickRateChange >= 0 ? "up" : "down",
      },
      responseRate: {
        value: Number.parseFloat(responseRate.toFixed(1)),
        change: Number.parseFloat(responseRateChange.toFixed(1)),
        trend: responseRateChange >= 0 ? "up" : "down",
      },
    };
  }

  async function getCampaignStats(): Promise<{
    total: number;
    active: number;
    scheduled: number;
    completed: number;
  }> {
    const thirtyDaysAgo = subDays(new Date(), 30);

    const totalCampaigns = await db
      .select({ count: count() })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.createdById, user.id),
          gte(campaigns.createdAt, thirtyDaysAgo)
        )
      )
      .execute()
      .then((result) => result[0]?.count || 0);

    const activeCampaigns = await db
      .select({ count: count() })
      .from(campaigns)
      .where(
        and(eq(campaigns.createdById, user.id), eq(campaigns.status, "activa"))
      )
      .execute()
      .then((result) => result[0]?.count || 0);

    const scheduledCampaigns = await db
      .select({ count: count() })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.createdById, user.id),
          eq(campaigns.status, "programada")
        )
      )
      .execute()
      .then((result) => result[0]?.count || 0);

    const completedCampaigns = await db
      .select({ count: count() })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.createdById, user.id),
          eq(campaigns.status, "completada"),
          gte(campaigns.completedAt, thirtyDaysAgo)
        )
      )
      .execute()
      .then((result) => result[0]?.count || 0);

    return {
      total: totalCampaigns,
      active: activeCampaigns,
      scheduled: scheduledCampaigns,
      completed: completedCampaigns,
    };
  }

  // Fetch data
  const recentCampaigns = await getRecentCampaigns();
  const contactStats = await getContactStats();
  const nextCampaign = await getNextCampaign();
  const scheduledCampaigns = await getScheduledCampaigns();
  const performanceMetrics = await getPerformanceMetrics();
  const campaignStats = await getCampaignStats();

  return (
    <div className="container mx-auto max-w-7xl space-y-8 py-6">
      {/* Header with welcome and quick actions */}
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenido, {user.name || "Usuario"}
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus campañas y monitorea el rendimiento
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Campaña
          </Button>
          <Button variant="outline" size="icon">
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <DashboardMetrics />

      {/* Main Content Area */}
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="mb-6 w-full justify-start space-x-4 border-b bg-transparent p-0">
          <TabsTrigger
            value="campaigns"
            className="border-b-2 border-transparent px-0 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Campañas
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="border-b-2 border-transparent px-0 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Programación
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="border-b-2 border-transparent px-0 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Rendimiento
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-8">
          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Campaign Stats Card */}
            <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm dark:from-blue-950/20 dark:to-indigo-950/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Resumen de Campañas
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">
                      {campaignStats.total}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Últimos 30 días
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">
                      {campaignStats.active}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Activas
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">
                      {campaignStats.scheduled}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Programadas
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">
                      {campaignStats.completed}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Completadas
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Stats Card */}
            <Card className="overflow-hidden border-none bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm dark:from-green-950/20 dark:to-emerald-950/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Contactos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">
                      {contactStats.total.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">Total</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">
                      {contactStats.newCount}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Nuevos
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">
                      {contactStats.listCount}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Listas
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold">
                      {contactStats.responseRate.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Tasa respuesta
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Campaign Card */}
            <Card className="overflow-hidden border-none bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm dark:from-amber-950/20 dark:to-orange-950/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Próximo Envío
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                {nextCampaign ? (
                  <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-medium">{nextCampaign.name}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {format(nextCampaign.scheduledAt, "d MMM, h:mm a", {
                          locale: es,
                        })}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {nextCampaign.contactCount} contactos
                      </div>
                    </div>
                    <Button size="sm" className="mt-2 w-full">
                      Ver detalles
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      No hay envíos programados
                    </p>
                    <Button size="sm" className="mt-4">
                      Programar campaña
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campañas recientes</CardTitle>
                  <CardDescription>
                    Monitorea el rendimiento de tus últimas campañas
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  Ver todas
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-6">
                {recentCampaigns.length > 0 ? (
                  recentCampaigns.map((campaign, i) => (
                    <div
                      key={i}
                      className="group rounded-lg p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{campaign.name}</h4>
                            <Badge
                              variant={
                                campaign.status === "activa"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {campaign.sentAt
                              ? format(campaign.sentAt, "d MMM yyyy", {
                                  locale: es,
                                })
                              : "No enviada"}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mb-3 grid grid-cols-3 gap-4 text-sm">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>Enviados</span>
                          </div>
                          <span className="text-lg font-medium">
                            {campaign.totalSent}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span>Abiertos</span>
                          </div>
                          <span className="text-lg font-medium">
                            {campaign.openRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span>Respuestas</span>
                          </div>
                          <span className="text-lg font-medium">
                            {campaign.replyRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <Progress
                        value={
                          campaign.status === "completada"
                            ? 100
                            : campaign.status === "activa"
                            ? 45
                            : 0
                        }
                        className="h-1.5"
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Mail className="mb-2 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium">
                      No hay campañas recientes
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Crea tu primera campaña para comenzar a enviar emails a
                      tus contactos
                    </p>
                    <Button className="mt-4 gap-2">
                      <Plus className="h-4 w-4" />
                      Nueva Campaña
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Engagement Card */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Estadísticas de participación</CardTitle>
                  <CardDescription>
                    Resumen de interacción con tus campañas
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share2 className="h-4 w-4" />
                  Exportar datos
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Tasa de conversión</h3>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-3xl font-bold">4.2%</span>
                    <span className="flex items-center text-sm font-medium text-green-500">
                      <ArrowRight className="h-3 w-3 rotate-45" />
                      +1.2%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Porcentaje de contactos que realizaron una acción deseada
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium">Tasa de apertura</h3>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-3xl font-bold">
                      {performanceMetrics.openRate.value}%
                    </span>
                    <span
                      className={`flex items-center text-sm font-medium ${
                        performanceMetrics.openRate.trend === "up"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <ArrowRight
                        className={`h-3 w-3 ${
                          performanceMetrics.openRate.trend === "up"
                            ? "rotate-45"
                            : "rotate-135"
                        }`}
                      />
                      {performanceMetrics.openRate.change > 0 ? "+" : ""}
                      {performanceMetrics.openRate.change}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Porcentaje de emails abiertos del total enviado
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">Tasa de respuesta</h3>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-3xl font-bold">
                      {performanceMetrics.responseRate.value}%
                    </span>
                    <span
                      className={`flex items-center text-sm font-medium ${
                        performanceMetrics.responseRate.trend === "up"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <ArrowRight
                        className={`h-3 w-3 ${
                          performanceMetrics.responseRate.trend === "up"
                            ? "rotate-45"
                            : "rotate-135"
                        }`}
                      />
                      {performanceMetrics.responseRate.change > 0 ? "+" : ""}
                      {performanceMetrics.responseRate.change}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Porcentaje de emails que recibieron respuesta
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Campañas programadas</CardTitle>
                  <CardDescription>
                    Gestiona tus próximos envíos de email
                  </CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Programar campaña
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {scheduledCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {scheduledCampaigns.map((campaign, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(campaign.scheduledAt, "d MMM, h:mm a", {
                              locale: es,
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {campaign.recipients} <Users className="h-4 w-4" />
                            {campaign.recipients} contactos
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {campaign.template}
                          </div>
                        </div>
                        {campaign.lists.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {campaign.lists.map((list, j) => (
                              <Badge
                                key={j}
                                variant="outline"
                                className="text-xs"
                              >
                                {list}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="mb-2 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium">
                    No hay campañas programadas
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Programa tu primera campaña para comenzar a enviar emails a
                    tus contactos
                  </p>
                  <Button className="mt-4 gap-2">
                    <Plus className="h-4 w-4" />
                    Programar campaña
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Tasa de apertura
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">
                      {performanceMetrics.openRate.value}%
                    </span>
                    <span
                      className={`flex items-center text-sm font-medium ${
                        performanceMetrics.openRate.trend === "up"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <ArrowRight
                        className={`h-3 w-3 ${
                          performanceMetrics.openRate.trend === "up"
                            ? "rotate-45"
                            : "rotate-135"
                        }`}
                      />
                      {performanceMetrics.openRate.change > 0 ? "+" : ""}
                      {performanceMetrics.openRate.change}%
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    vs. periodo anterior
                  </span>
                </div>
                <div className="mt-4">
                  <Progress
                    value={performanceMetrics.openRate.value}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Tasa de clics
                  </CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">
                      {performanceMetrics.clickRate.value}%
                    </span>
                    <span
                      className={`flex items-center text-sm font-medium ${
                        performanceMetrics.clickRate.trend === "up"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <ArrowRight
                        className={`h-3 w-3 ${
                          performanceMetrics.clickRate.trend === "up"
                            ? "rotate-45"
                            : "rotate-135"
                        }`}
                      />
                      {performanceMetrics.clickRate.change > 0 ? "+" : ""}
                      {performanceMetrics.clickRate.change}%
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    vs. periodo anterior
                  </span>
                </div>
                <div className="mt-4">
                  <Progress
                    value={performanceMetrics.clickRate.value}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    Tasa de respuesta
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">
                      {performanceMetrics.responseRate.value}%
                    </span>
                    <span
                      className={`flex items-center text-sm font-medium ${
                        performanceMetrics.responseRate.trend === "up"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      <ArrowRight
                        className={`h-3 w-3 ${
                          performanceMetrics.responseRate.trend === "up"
                            ? "rotate-45"
                            : "rotate-135"
                        }`}
                      />
                      {performanceMetrics.responseRate.change > 0 ? "+" : ""}
                      {performanceMetrics.responseRate.change}%
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    vs. periodo anterior
                  </span>
                </div>
                <div className="mt-4">
                  <Progress
                    value={performanceMetrics.responseRate.value}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Análisis detallado</CardTitle>
                  <CardDescription>
                    Métricas avanzadas de rendimiento de tus campañas
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ListFilter className="h-4 w-4" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center text-center">
                  <Loader2 className="mb-4 h-10 w-10 animate-spin text-muted-foreground/70" />
                  <h3 className="text-lg font-medium">Generando análisis</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Estamos procesando tus datos para generar un análisis
                    detallado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
