import { cache } from "react";
import { auth } from "@/auth";

export default cache(auth); //de-duplicates the request within one server request. When we refresh the page, we fetch the session and it gets cached, so that all components get the session from the cache. When we refresh, the cache is cleared and fetches session again
