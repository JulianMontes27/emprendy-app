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
import {
  Users,
  Clock,
  Plus,
  Mail,
  Eye,
  MessageSquare,
  ArrowRight,
  Zap,
  ChevronRight,
  ListFilter,
  Share2,
  AlertCircle,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import getSession from "@/lib/get-session";
import { db } from "@/db";
import {
  campaigns,
  campaignsToLists,
  contacts,
  emailClicks,
  emailOpens,
  emailTemplates,
  emailTracking,
  lists,
} from "@/db/schema";
import { eq, count, desc, and, gte, lte } from "drizzle-orm";
import { subDays, format } from "date-fns";
import { es } from "date-fns/locale";
import type { Campaign } from "@/types/types";

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

export default async function DashboardPage() {
  const session = await getSession();
  const user = session?.user;

  if (!user || !user.id) return null;

  async function getRecentCampaigns(): Promise<Campaign[]> {
    if (!user) throw new Error("User is undefined");

    const thirtyDaysAgo = subDays(new Date(), 30);

    const campaignData = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        sentAt: campaigns.sentAt,
        createdAt: campaigns.createdAt,
      })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.createdById, user.id!),
          gte(campaigns.createdAt, thirtyDaysAgo)
        )
      )
      .orderBy(desc(campaigns.createdAt))
      .limit(4);

    const enrichedCampaigns = await Promise.all(
      campaignData.map(async (campaign) => {
        const sentCount = await db
          .select({ count: count() })
          .from(emailTracking)
          .where(eq(emailTracking.campaignId, campaign.id))
          .then((result) => result[0]?.count || 0);

        const openCount = await db
          .select({ count: count() })
          .from(emailOpens)
          .innerJoin(emailTracking, eq(emailOpens.emailId, emailTracking.id))
          .where(eq(emailTracking.campaignId, campaign.id))
          .then((result) => result[0]?.count || 0);

        const clickCount = await db
          .select({ count: count() })
          .from(emailClicks)
          .innerJoin(emailTracking, eq(emailClicks.emailId, emailTracking.id))
          .where(eq(emailTracking.campaignId, campaign.id))
          .then((result) => result[0]?.count || 0);

        const openRate = sentCount > 0 ? (openCount / sentCount) * 100 : 0;
        const replyRate = sentCount > 0 ? (clickCount / sentCount) * 100 : 0;

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
    if (!user) throw new Error("User is undefined");

    const thirtyDaysAgo = subDays(new Date(), 30);

    const totalContacts = await db
      .select({ count: count() })
      .from(contacts)
      .where(eq(contacts.userId, user.id!))
      .then((result) => result[0]?.count || 0);

    const newContacts = await db
      .select({ count: count() })
      .from(contacts)
      .where(
        and(
          eq(contacts.userId, user.id!),
          gte(contacts.createdAt, thirtyDaysAgo)
        )
      )
      .then((result) => result[0]?.count || 0);

    const listCount = await db
      .select({ count: count() })
      .from(lists)
      .where(eq(lists.createdById, user.id!))
      .then((result) => result[0]?.count || 0);

    const messageCount = await db
      .select({ count: count() })
      .from(emailTracking)
      .where(eq(emailTracking.userId, user.id!))
      .then((result) => result[0]?.count || 0);

    const responseCount = await db
      .select({ count: count() })
      .from(emailClicks)
      .innerJoin(emailTracking, eq(emailClicks.emailId, emailTracking.id))
      .where(eq(emailTracking.userId, user.id!))
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
    if (!user) throw new Error("User is undefined");

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
          eq(campaigns.createdById, user.id!),
          eq(campaigns.status, "programada"),
          gte(campaigns.scheduledAt, now)
        )
      )
      .orderBy(campaigns.scheduledAt)
      .limit(1);

    if (nextCampaignData.length === 0) return null;

    const campaign = nextCampaignData[0];

    const contactCount = await db
      .select({ count: count() })
      .from(emailTracking)
      .where(eq(emailTracking.campaignId, campaign.id)) // Fix: Use campaignId
      .then((result) => result[0]?.count || 0);

    return {
      id: campaign.id,
      name: campaign.name,
      scheduledAt: campaign.scheduledAt!,
      contactCount,
    };
  }

  async function getScheduledCampaigns(): Promise<ScheduledCampaign[]> {
    if (!user) throw new Error("User is undefined");

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
          eq(campaigns.createdById, user.id!),
          eq(campaigns.status, "programada"),
          gte(campaigns.scheduledAt, now)
        )
      )
      .orderBy(campaigns.scheduledAt)
      .limit(3);

    const enrichedCampaigns = await Promise.all(
      scheduledCampaignsData.map(async (campaign) => {
        const templateData = await db
          .select({ name: emailTemplates.name })
          .from(emailTemplates)
          .where(eq(emailTemplates.id, campaign.templateId))
          .then((result) => result[0]?.name || "Plantilla sin nombre");

        const recipientsCount = await db
          .select({ count: count() })
          .from(emailTracking)
          .where(eq(emailTracking.campaignId, campaign.id)) // Fix: Use campaignId
          .then((result) => result[0]?.count || 0);

        const listsData = await db
          .select({ name: lists.name })
          .from(lists)
          .innerJoin(campaignsToLists, eq(campaignsToLists.listId, lists.id))
          .where(eq(campaignsToLists.campaignId, campaign.id));

        const listNames = listsData.map((list) => list.name);

        return {
          id: campaign.id,
          name: campaign.name,
          scheduledAt: campaign.scheduledAt!,
          recipients: recipientsCount,
          template: templateData,
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
    if (!user) throw new Error("User is undefined");

    const thirtyDaysAgo = subDays(new Date(), 30);
    const sixtyDaysAgo = subDays(new Date(), 60);

    const currentPeriodMetrics = await db
      .select({
        totalMessages: count(emailTracking.id),
        openedMessages: count(emailOpens.id),
        clickedMessages: count(emailClicks.id),
      })
      .from(emailTracking)
      .leftJoin(emailOpens, eq(emailOpens.emailId, emailTracking.id))
      .leftJoin(emailClicks, eq(emailClicks.emailId, emailTracking.id))
      .where(
        and(
          eq(emailTracking.userId, user.id),
          gte(emailTracking.sentAt, thirtyDaysAgo)
        )
      )
      .then((result) => result[0]);

    const previousPeriodMetrics = await db
      .select({
        totalMessages: count(emailTracking.id),
        openedMessages: count(emailOpens.id),
        clickedMessages: count(emailClicks.id),
      })
      .from(emailTracking)
      .leftJoin(emailOpens, eq(emailOpens.emailId, emailTracking.id))
      .leftJoin(emailClicks, eq(emailClicks.emailId, emailTracking.id))
      .where(
        and(
          eq(emailTracking.userId, user.id),
          gte(emailTracking.sentAt, sixtyDaysAgo),
          lte(emailTracking.sentAt, thirtyDaysAgo)
        )
      )
      .then((result) => result[0]);

    const current = currentPeriodMetrics;
    const previous = previousPeriodMetrics;

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
    if (!user) throw new Error("User is undefined");

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
      .then((result) => result[0]?.count || 0);

    const activeCampaigns = await db
      .select({ count: count() })
      .from(campaigns)
      .where(
        and(eq(campaigns.createdById, user.id), eq(campaigns.status, "activa"))
      )
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
      .then((result) => result[0]?.count || 0);

    return {
      total: totalCampaigns,
      active: activeCampaigns,
      scheduled: scheduledCampaigns,
      completed: completedCampaigns,
    };
  }

  const recentCampaigns = await getRecentCampaigns();
  const contactStats = await getContactStats();
  const nextCampaign = await getNextCampaign();
  const scheduledCampaigns = await getScheduledCampaigns();
  const performanceMetrics = await getPerformanceMetrics();
  const campaignStats = await getCampaignStats();

  // Completely redesigned layout with sidebar navigation
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Mobile sidebar */}
      <div className="md:hidden">
        {/* Mobile sidebar would go here - simplified for this example */}
      </div>
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Dashboard content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Monitorea el rendimiento de tus campañas de email marketing
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button className="gap-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                <Plus className="h-4 w-4" />
                Nueva Campaña
              </Button>
            </div>
          </div>

          {/* Key metrics */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Campañas Activas
                    </p>
                    <h3 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                      {campaignStats.active}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <Mail className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="flex items-center text-emerald-500 dark:text-emerald-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    12%
                  </span>
                  <span className="ml-2 text-slate-500 dark:text-slate-400">
                    vs. mes anterior
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tasa de Apertura
                    </p>
                    <h3 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                      {performanceMetrics.openRate.value}%
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                    <Eye className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span
                    className={`flex items-center ${
                      performanceMetrics.openRate.trend === "up"
                        ? "text-emerald-500 dark:text-emerald-400"
                        : "text-rose-500 dark:text-rose-400"
                    }`}
                  >
                    {performanceMetrics.openRate.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ChevronDown className="mr-1 h-3 w-3" />
                    )}
                    {Math.abs(performanceMetrics.openRate.change)}%
                  </span>
                  <span className="ml-2 text-slate-500 dark:text-slate-400">
                    vs. mes anterior
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Tasa de Respuesta
                    </p>
                    <h3 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                      {performanceMetrics.responseRate.value}%
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span
                    className={`flex items-center ${
                      performanceMetrics.responseRate.trend === "up"
                        ? "text-emerald-500 dark:text-emerald-400"
                        : "text-rose-500 dark:text-rose-400"
                    }`}
                  >
                    {performanceMetrics.responseRate.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ChevronDown className="mr-1 h-3 w-3" />
                    )}
                    {Math.abs(performanceMetrics.responseRate.change)}%
                  </span>
                  <span className="ml-2 text-slate-500 dark:text-slate-400">
                    vs. mes anterior
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Contactos
                    </p>
                    <h3 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                      {contactStats.total.toLocaleString()}
                    </h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="flex items-center text-emerald-500 dark:text-emerald-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    {contactStats.newCount}
                  </span>
                  <span className="ml-2 text-slate-500 dark:text-slate-400">
                    nuevos este mes
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent campaigns - takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                      Campañas recientes
                    </CardTitle>
                    <CardDescription>
                      Monitorea el rendimiento de tus últimas campañas
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300"
                  >
                    Ver todas
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentCampaigns.length > 0 ? (
                    <div className="space-y-4">
                      {recentCampaigns.map((campaign, i) => (
                        <div
                          key={i}
                          className="group rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-indigo-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900/50"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-slate-900 dark:text-white">
                                  {campaign.name}
                                </h4>
                                <Badge
                                  variant={
                                    campaign.status === "activa"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="bg-indigo-100 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                                >
                                  {campaign.status}
                                </Badge>
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
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
                              className="h-8 w-8 rounded-full text-slate-400 opacity-0 transition-opacity hover:text-slate-900 group-hover:opacity-100 dark:text-slate-500 dark:hover:text-slate-300"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="mb-3 grid grid-cols-3 gap-4 text-sm">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <Mail className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                                <span>Enviados</span>
                              </div>
                              <span className="text-lg font-medium text-slate-900 dark:text-white">
                                {campaign.totalSent}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <Eye className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                                <span>Abiertos</span>
                              </div>
                              <span className="text-lg font-medium text-slate-900 dark:text-white">
                                {campaign.openRate.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                                <MessageSquare className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                                <span>Respuestas</span>
                              </div>
                              <span className="text-lg font-medium text-slate-900 dark:text-white">
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
                            className="h-1.5 bg-slate-100 dark:bg-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-12 text-center dark:border-slate-800">
                      <Mail className="mb-2 h-12 w-12 text-slate-300 dark:text-slate-700" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                        No hay campañas recientes
                      </h3>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Crea tu primera campaña para comenzar a enviar emails a
                        tus contactos
                      </p>
                      <Button className="mt-4 gap-2 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                        <Plus className="h-4 w-4" />
                        Nueva Campaña
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance metrics */}
              <Card className="mt-6 border-none bg-white shadow-sm dark:bg-slate-900">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                      Rendimiento
                    </CardTitle>
                    <CardDescription>
                      Análisis de métricas clave
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <ListFilter className="h-4 w-4" />
                      Filtrar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Share2 className="h-4 w-4" />
                      Exportar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="mb-2 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          Tasa de apertura
                        </h3>
                      </div>
                      <div className="mt-2 flex items-end justify-between">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          {performanceMetrics.openRate.value}%
                        </span>
                        <span
                          className={`flex items-center text-sm font-medium ${
                            performanceMetrics.openRate.trend === "up"
                              ? "text-emerald-500 dark:text-emerald-400"
                              : "text-rose-500 dark:text-rose-400"
                          }`}
                        >
                          {performanceMetrics.openRate.trend === "up" ? (
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          ) : (
                            <ChevronDown className="mr-1 h-3 w-3" />
                          )}
                          {Math.abs(performanceMetrics.openRate.change)}%
                        </span>
                      </div>
                      <Progress
                        value={performanceMetrics.openRate.value}
                        className="mt-3 h-1.5 bg-slate-200 dark:bg-slate-700"
                      />
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="mb-2 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          Tasa de clics
                        </h3>
                      </div>
                      <div className="mt-2 flex items-end justify-between">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          {performanceMetrics.clickRate.value}%
                        </span>
                        <span
                          className={`flex items-center text-sm font-medium ${
                            performanceMetrics.clickRate.trend === "up"
                              ? "text-emerald-500 dark:text-emerald-400"
                              : "text-rose-500 dark:text-rose-400"
                          }`}
                        >
                          {performanceMetrics.clickRate.trend === "up" ? (
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          ) : (
                            <ChevronDown className="mr-1 h-3 w-3" />
                          )}
                          {Math.abs(performanceMetrics.clickRate.change)}%
                        </span>
                      </div>
                      <Progress
                        value={performanceMetrics.clickRate.value}
                        className="mt-3 h-1.5 bg-slate-200 dark:bg-slate-700"
                      />
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <div className="mb-2 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-violet-500 dark:text-violet-400" />
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          Tasa de respuesta
                        </h3>
                      </div>
                      <div className="mt-2 flex items-end justify-between">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                          {performanceMetrics.responseRate.value}%
                        </span>
                        <span
                          className={`flex items-center text-sm font-medium ${
                            performanceMetrics.responseRate.trend === "up"
                              ? "text-emerald-500 dark:text-emerald-400"
                              : "text-rose-500 dark:text-rose-400"
                          }`}
                        >
                          {performanceMetrics.responseRate.trend === "up" ? (
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                          ) : (
                            <ChevronDown className="mr-1 h-3 w-3" />
                          )}
                          {Math.abs(performanceMetrics.responseRate.change)}%
                        </span>
                      </div>
                      <Progress
                        value={performanceMetrics.responseRate.value}
                        className="mt-3 h-1.5 bg-slate-200 dark:bg-slate-700"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right sidebar - takes 1 column */}
            <div className="space-y-6">
              {/* Next campaign card */}
              <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Próximo Envío
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {nextCampaign ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                          {nextCampaign.name}
                        </h3>
                        <Badge className="bg-indigo-100 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                          Programada
                        </Badge>
                      </div>
                      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                        <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                          <Clock className="mr-2 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                          {format(nextCampaign.scheduledAt, "d MMM, h:mm a", {
                            locale: es,
                          })}
                        </div>
                        <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                          <Users className="mr-2 h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                          {nextCampaign.contactCount} contactos
                        </div>
                      </div>
                      <Button className="mt-2 w-full bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                        Ver detalles
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 py-8 text-center dark:border-slate-800">
                      <AlertCircle className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-700" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No hay envíos programados
                      </p>
                      <Button
                        size="sm"
                        className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                      >
                        Programar campaña
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Campaign stats */}
              <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Resumen de Campañas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Total
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                        {campaignStats.total}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Últimos 30 días
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Activas
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                        {campaignStats.active}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        En progreso
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Programadas
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                        {campaignStats.scheduled}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Pendientes
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Completadas
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                        {campaignStats.completed}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Últimos 30 días
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact stats */}
              <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                    Contactos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Total de contactos
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {contactStats.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Nuevos contactos
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {contactStats.newCount}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Listas
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {contactStats.listCount}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Tasa de respuesta
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {contactStats.responseRate.toFixed(1)}%
                      </p>
                    </div>
                    <Button variant="outline" className="mt-2 w-full">
                      Gestionar contactos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
