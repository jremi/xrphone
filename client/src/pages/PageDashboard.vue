<template>
  <div id="page-dashboard-container">
    <div class="container">
      <b-tabs
        v-model="activeTab"
        size="is-medium"
        position="is-left"
        class="block"
        type="is-boxed"
        @input="onTabChange"
      >
        <b-tab-item label="Invoices" icon="receipt">
          <div class="card">
            <b-table striped :data="paidInvoices">
              <b-table-column
                field="timestamp"
                label="Date/Time"
                v-slot="props"
              >
                {{ props.row.timestamp | moment("MM/DD/YYYY - hh:mm A") }}
              </b-table-column>
              <b-table-column
                :field="
                  isMerchantAccount ? 'destinationAddress' : 'sourceAddress'
                "
                :label="isMerchantAccount ? 'Customer' : 'Merchant'"
                v-slot="props"
              >
                {{
                  isMerchantAccount
                    ? props.row.sourceAddress
                    : props.row.destinationAddress
                }}
              </b-table-column>
              <b-table-column field="memo" label="Memo" v-slot="props">
                {{ props.row.memo }}
              </b-table-column>
              <b-table-column
                field="deliveredAmount"
                label="Amount"
                v-slot="props"
              >
                <b-tag
                  :type="isMerchantAccount ? 'is-green' : 'is-danger'"
                  class="has-text-weight-bold"
                  >{{ isMerchantAccount ? "+" : "-"
                  }}{{ props.row.deliveredAmount }}</b-tag
                >
              </b-table-column>
              <b-table-column
                field="xrplExplorer"
                label="XRPL"
                v-slot="props"
                width="40"
              >
                <b-button
                  type="is-dark"
                  icon-left="external-link-alt"
                  tag="a"
                  :href="props.row.xrplExplorer"
                  target="_blank"
                />
              </b-table-column>
            </b-table>
          </div>
        </b-tab-item>
        <b-tab-item label="Settings" icon="cog">
          <div class="card p-4">
            <div class="columns">
              <div class="column">
                <b-field
                  :label="
                    isMerchantAccount
                      ? 'XRPhone Merchant Number'
                      : 'XRPhone Number'
                  "
                >
                  <b-tag
                    type="is-dark"
                    class="has-text-weight-bold"
                    size="is-medium"
                  >
                    {{ userSettings.phoneNumber }}
                  </b-tag>
                </b-field>
              </div>
              <div class="column">
                <b-field label="Toll-Free Payments Number">
                  <b-tag
                    type="is-primary"
                    class="has-text-weight-bold"
                    size="is-medium"
                  >
                    +18447390111</b-tag
                  >
                </b-field>
              </div>
            </div>

            <b-field label="XRP Account">
              <b-input
                v-if="isMerchantAccount"
                v-model="userSettings.xrpAccount"
                placeholder="XRP Address"
              />
              <div v-else class="xrp-account">
                {{ userSettings.xrpAccount }}
              </div>
            </b-field>
            <b-field>
              <b-checkbox
                class="has-text-weight-bold"
                v-model="isCentralizedExchange"
              >
                Account on CEX (e.g: Uphold, KuCoin)
              </b-checkbox>
            </b-field>
            <b-field label="Destination Tag" v-if="isCentralizedExchange">
              <b-input
                v-model="userSettings.destinationTag"
                placeholder="Destination Tag"
                icon="tag"
              />
            </b-field>
            <b-field label="XRPL Network">
              <XrplNetworkSelect
                v-if="userSettings.xrplNetwork"
                v-model="userSettings.xrplNetwork"
              />
            </b-field>
            <b-field v-if="!isMerchantAccount" label="XUMM Wallet">
              <div class="columns is-align-items-center">
                <div class="column is-8">
                  <b-message class="is-7" type="is-info" has-icon>
                    Is your wallet not connecting? Sign into XUMM again to
                    re-establish your wallet connection with XRPhone.
                  </b-message>
                </div>
                <div class="column">
                  <b-button @click="xummSignIn" expanded type="is-dark"
                    >XUMM Sign In</b-button
                  >
                </div>
              </div>
            </b-field>
            <b-field v-if="isMerchantAccount" label="App Integration">
              <div class="columns" v-if="userSettings.appIntegrationId">
                <div class="column is-4">
                  <div
                    v-if="userSettings.appIntegrationId === 'freshbooks'"
                    class="card"
                  >
                    <img
                      :src="appIntegrationLogo.freshbooks"
                      class="app-integration-logo"
                    />
                    <footer class="card-footer">
                      <a
                        @click="disconnectAppIntegration"
                        class="card-footer-item has-text-weight-bold"
                        >Disconnect</a
                      >
                    </footer>
                  </div>
                </div>
              </div>
              <div v-else>
                <b-message type="is-danger" has-icon>
                  You currently do not have any app integration connected to
                  XRPhone. Please connect app from below to begin using XRPhone
                  with your customers.
                </b-message>
                <ConnectApp
                  @onConnectAppCompleted="onConnectAppCompleted"
                  :phone-number="userAccount.phoneNumber"
                  :xrpl-network="userAccount.xrplNetwork"
                  :xrp-account="userAccount.xrpAccount"
                  hide-title
                />
              </div>
            </b-field>
            <b-field label="Danger Zone">
              <b-button @click="deleteAccount" type="is-danger"
                >Delete XRPhone Account</b-button
              >
            </b-field>
          </div>
          <div class="columns is-centered">
            <div class="column is-5 ">
              <b-button
                @click="saveSettings"
                :loading="isLoading"
                expanded
                type="is-dark"
                class="has-text-weight-bold mt-4"
                >Save Settings</b-button
              >
            </div>
          </div>
        </b-tab-item>
      </b-tabs>
      <b-loading
        v-model="isLoading"
        :is-full-page="false"
        :can-cancel="false"
      ></b-loading>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import XrplNetworkSelect from "@/components/common/XrplNetworkSelect";
import ConnectApp from "@/components/setup/merchant/ConnectApp";
import freshbooksLogo from "@/assets/images/logos/other/freshbooks-logo.png";

export default {
  name: "PageDashboard",
  components: {
    XrplNetworkSelect,
    ConnectApp,
  },
  data() {
    return {
      isLoading: false,
      activeTab: 0,
      paidInvoices: [],
      userSettings: {},
      isCentralizedExchange: false,
      backgroundPoller: {
        paidInvoices: null,
      },
      appIntegrationLogo: {
        freshbooks: freshbooksLogo,
      },
    };
  },
  async created() {
    this.isLoading = true;
    this.getPaidInvoices(() => (this.isLoading = false));
    this.getSettings();
    // For now: setup background poller for getting paid invoices
    this.backgroundPoller.paidInvoices = setInterval(
      () => this.paidInvoicesPoller(),
      10000
    );
  },
  beforeDestroy() {
    clearInterval(this.backgroundPoller.paidInvoices);
  },
  computed: {
    ...mapGetters(["userAccount"]),
    tabId() {
      const tabIds = {
        0: "paid_invoices",
        1: "settings",
      };
      return tabIds[this.activeTab];
    },
    isMerchantAccount() {
      return this.userAccount.accountType === "merchant";
    },
  },
  methods: {
    ...mapActions(["clearUser"]),
    onTabChange() {
      switch (this.tabId) {
        case "paid_invoices":
          this.getPaidInvoices();
          break;
        case "settings":
          this.getSettings();
          break;
      }
    },
    paidInvoicesPoller() {
      if (this.tabId === "paid_invoices") {
        this.getPaidInvoices();
      }
    },
    getPaidInvoices(cb) {
      this.axios.get("/user/paid-invoices").then(({ data: paidInvoices }) => {
        this.paidInvoices = paidInvoices;
        if (cb) cb();
      });
    },
    getSettings() {
      this.axios.get("/user/settings").then(({ data: userSettings }) => {
        this.userSettings = userSettings;
        if (userSettings.destinationTag) {
          this.isCentralizedExchange = true;
        }
      });
    },
    xummSignIn() {
      const height = 825;
      const width = 400;
      const top = window.top.outerHeight / 2 + window.top.screenY - height / 2;
      const left = window.top.outerWidth / 2 + window.top.screenX - width / 2;
      /**
       * Safari is blocking any call to window.open() which is made inside an async call.
       * Creating window reference oAuthConnectWindow. Setting window reference location to
       * the XUMM signIn url that gets returned in promise response.
       */
      const oAuthConnectWindow = window.open(
        "",
        "_blank",
        `toolbar=no,scrollbars=yes,resizable=no,top=${top},left=${left},width=${width},height=${height}`
      );
      this.axios
        .get("/xumm/signin", {
          params: {
            type: "XUMM_SIGN_IN_AGAIN",
            customerPhoneNumber: this.userSettings.phoneNumber,
          },
        })
        .then(({ data: signIn }) => {
          oAuthConnectWindow.location = signIn.next.always;
        })
        .catch(() => {
          this.showNotification("is-danger", "Problem creating XUMM sign-in!");
        });
    },
    disconnectAppIntegration() {
      this.$buefy.dialog.confirm({
        title: "Disconnect App",
        message:
          "Are you sure you want to <b>disconnect</b> this app? Your customers will no longer be able to pay your invoices via XRPhone.",
        confirmText: "Disconnect App",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => {
          this.userSettings.appIntegrationId = null;
          this.saveSettings();
          this.$buefy.toast.open("App disconnected!");
        },
      });
    },
    onConnectAppCompleted() {
      this.getSettings();
    },
    deleteAccount() {
      this.$buefy.dialog.confirm({
        title: "Delete XRPhone Account",
        message: "Are you sure you want to <b>delete</b> XRPhone account?",
        confirmText: "Delete Account",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => {
          this.axios.delete("/user").then(() => {
            this.clearUser();
            this.$buefy.toast.open("Account deleted!");
            this.$router.push({ name: "sign-in" });
          });
        },
      });
    },
    async saveSettings() {
      if (this.isMerchantAccount) {
        if (
          this.userSettings.xrpAccount.length < 25 ||
          this.userSettings.xrpAccount.length > 35
        ) {
          this.showNotification(
            "is-danger",
            `The XRP account you entered does not appear valid. 
            XRP accounts are between 25 and 35 characters in length.`
          );
          return;
        }
        if (this.isCentralizedExchange) {
          if (this.userSettings.destinationTag.length < 1) {
            this.showNotification(
              "is-danger",
              "The destination tag is required!"
            );
            return;
          }
        } else {
          this.userSettings.destinationTag = null;
        }
      }
      this.isLoading = true;
      await this.axios.patch("/user/settings", this.userSettings);
      this.isLoading = false;
    },
  },
};
</script>
