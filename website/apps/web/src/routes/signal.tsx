import { groundrayMeta } from "../components/groundray-page";

export { default } from "../components/groundray-page";

export function meta() {
  return [...groundrayMeta(), { name: "robots", content: "noindex, follow" }];
}
