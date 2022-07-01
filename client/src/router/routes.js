import PageLanding from "@/pages/PageLanding.vue";
import PageSignUp from "../pages/PageSignUp.vue";
import PageSignUpSetup from "../pages/PageSignUpSetup.vue";
import PageSignIn from "../pages/PageSignIn.vue";
import PageDashboard from "../pages/PageDashboard.vue";
import PageInvoicePay from "../pages/PageInvoicePay.vue";

import store from "../store";

const requiresAuth = (next) => {
  if (store.getters.isUserSignedIn) next();
  else next("/signup");
};

export default [
  {
    name: "landing",
    path: "/",
    component: PageLanding,
    beforeEnter(to, from, next) {
      if (store.getters.isUserSignedIn) {
        next("/dashboard");
      } else {
        next();
      }
    },
  },
  {
    name: "sign-up",
    path: "/signup",
    component: PageSignUp,
  },
  {
    name: "sign-up-setup",
    path: "/signup/:type",
    component: PageSignUpSetup,
    beforeEnter(to, from, next) {
      const typeParam = ["regular", "merchant"];
      if (!typeParam.includes(to.params.type)) next("/signup");
      else next();
    },
  },
  {
    name: "sign-in",
    path: "/signin",
    component: PageSignIn,
  },
  {
    name: "dashboard",
    path: "/dashboard",
    component: PageDashboard,
    beforeEnter(to, from, next) {
      requiresAuth(next);
    },
  },
  {
    name: "invoice-pay",
    path: "/invoice-pay/:base64Resource",
    component: PageInvoicePay,
  },
];
