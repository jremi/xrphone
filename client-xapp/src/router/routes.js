import xAppPagePhone from "@/pages/xAppPagePhone";
import xAppPagePayments from "@/pages/xAppPagePayments";
import xAppPageSettings from "@/pages/xAppPageSettings";

export default [
  {
    name: "index",
    path: "/",
    redirect: { name: 'xapp-phone' }
  },
  {
    name: "xapp-phone",
    path: "/xapp-phone",
    component: xAppPagePhone,
  },
  {
    name: "xapp-payments",
    path: "/xapp-payments",
    component: xAppPagePayments,
  },
  {
    name: "xapp-settings",
    path: "/xapp-settings",
    component: xAppPageSettings,
  },
];
