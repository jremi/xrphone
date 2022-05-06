<template>
  <div class="link-xrp-account-container">
    <div class="container">
      <section>
        <b-tabs
          v-model="activeTabIndex"
          size="is-medium"
          position="is-centered"
          class="block"
        >
          <b-tab-item label="XRPL">
            <img
              class="xrpl-logo"
              src="@/assets/images/logos/other/xrpl-logo.png"
            />
            <div class="columns is-align-items-center">
              <div class="column is-9">
                <b-input
                  custom-class="xrp-account-input"
                  v-model="xrpAccount"
                  placeholder="rwGte5VhVQRDMUT82zPnVwcq2mGGnk9xLj"
                  icon="cube"
                />
              </div>
              <div class="column">
                <XrplNetworkSelect v-model="xrplNetwork" size="is-small" />
              </div>
            </div>
            <div class="columns is-justify-content-space-between">
              <div class="column is-4">
                <b-input
                  :style="{
                    visibility: isCentralizedExchange ? 'visible' : 'hidden',
                  }"
                  custom-class="xrp-account-input"
                  v-model="destinationTag"
                  placeholder="Destination Tag"
                  icon="tag"
                />
              </div>
              <div class="column is-flex is-justify-content-end">
                <b-checkbox
                  class="has-text-weight-bold"
                  v-model="isCentralizedExchange"
                >
                  Account on CEX (e.g: Uphold, KuCoin)
                </b-checkbox>
              </div>
            </div>
          </b-tab-item>
          <b-tab-item label="PayString">
            <img
              class="paystring-logo"
              src="@/assets/images/logos/other/paystring-logo.png"
            />
            <div class="columns is-align-items-center">
              <div class="column is-9">
                <b-input
                  custom-class="paystring-input"
                  v-model="paystring"
                  placeholder="alice$wallet.com"
                  icon="cube"
                />
              </div>
              <div class="column">
                <b-field>
                  <XrplNetworkSelect v-model="xrplNetwork" size="is-small" />
                </b-field>
              </div>
            </div>
          </b-tab-item>
        </b-tabs>
        <b-button
          @click="submit"
          type="is-primary"
          size="is-medium"
          icon-right="chevron-right"
          ><strong>Continue</strong></b-button
        >
      </section>
    </div>
  </div>
</template>

<script>
import XrplNetworkSelect from "@/components/common/XrplNetworkSelect";

export default {
  name: "LinkXRPAccount",
  components: {
    XrplNetworkSelect,
  },
  data() {
    return {
      activeTabIndex: 0,
      xrpAccount: "",
      isCentralizedExchange: false,
      destinationTag: "",
      paystring: "",
      xrplNetwork: "MAINNET",
    };
  },
  computed: {
    selectedTab() {
      const tabNameMap = { 0: "xrpl", 1: "paystring" };
      return tabNameMap[this.activeTabIndex];
    },
  },
  methods: {
    submit() {
      if (this.selectedTab === "xrpl") {
        // XRP accounts between 25 and 35 characters in length
        if (this.xrpAccount.length >= 25 && this.xrpAccount.length <= 35) {
          const accountInfo = {
            xrpAccount: this.xrpAccount,
            xrplNetwork: this.xrplNetwork,
          };
          if (this.isCentralizedExchange) {
            if (this.destinationTag.length >= 1) {
              accountInfo.destinationTag = this.destinationTag;
            } else {
              this.showNotification(
                "is-danger",
                "The destination tag is required!"
              );
              return;
            }
          }
          this.$emit("onMerchantXrpAccountProvided", accountInfo);
          this.showNotification(
            "is-success",
            "Great, Thank's for providing your XRP account!"
          );
        } else {
          this.showNotification(
            "is-danger",
            `The XRP account you entered does not appear valid. 
            XRP accounts are between 25 and 35 characters in length.`
          );
        }
      } else if (this.selectedTab === "paystring") {
        if (this.paystring.length >= 3 && this.paystring.includes("$")) {
          // Perform PayString address validation
          this.axios
            .post("/paystring/verify", {
              paystring: this.paystring,
              xrplNetwork: this.xrplNetwork,
            })
            .then(({ data }) => {
              if (data.xrpAddress) {
                this.$emit("onMerchantXrpAccountProvided", {
                  xrpAccount: data.xrpAddress,
                  xrplNetwork: this.xrplNetwork,
                });
                this.showNotification(
                  "is-success",
                  "Great, we successfully obtained your XRP address from PayString!"
                );
                console.log("paystring was found", data.xrpAddress);
              } else {
                this.showNotification(
                  "is-danger",
                  "The PayString did not contain XRP address information. Please try again."
                );
              }
            });
        } else {
          this.showNotification(
            "is-danger",
            "The PayString address you entered does not appear valid."
          );
        }
      }
    },
  },
};
</script>
