<template>
  <div class="xapp-page-payments background">
    <table class="table">
      <thead class="tint text-primary">
        <tr>
          <th scope="col">Date/Time</th>
          <th scope="col">Transaction ID</th>
          <th scope="col">Details</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="invoice in paidInvoices" :key="invoice.txnId">
          <td class="text-secondary">
            {{ invoice.timestamp | moment("M/DD/YY") }}<br />{{
              invoice.timestamp | moment("hh:mm A")
            }}
          </td>
          <td>{{ invoice.txnId.slice(0, 12) + "..." }}</td>
          <td>
            <button
              type="button"
              class="btn btn-success"
              @click="viewTransaction(invoice.txnId)"
              v-wave
            >
              <i class="bi bi-receipt pr-2" />View
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!hasPaidInvoices" class="m-2 alert alert-primary" role="alert">
      <i class="bi bi-info-circle pr-2" />Currently no payments to display.
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
  name: "xAppPagePayments",
  data() {
    return {
      paidInvoices: [],
      backgroundPoller: {
        paidInvoices: null,
      },
    };
  },
  created() {
    this.getPaidInvoices();
    this.backgroundPoller.paidInvoices = setInterval(
      this.getPaidInvoices,
      10000
    );
  },
  mounted() {
    this.SET_SPINNER_OVERLAY(true);
  },
  beforeDestroy() {
    this.SET_SPINNER_OVERLAY(false);
    clearInterval(this.backgroundPoller.paidInvoices);
  },
  computed: {
    ...mapGetters(["xumm", "xrphone"]),
    hasPaidInvoices() {
      return this.paidInvoices?.length > 0;
    },
  },
  methods: {
    ...mapMutations(["SET_SPINNER_OVERLAY"]),
    getPaidInvoices(cb) {
      this.axios.get("/user/paid-invoices").then(({ data: paidInvoices }) => {
        this.paidInvoices = paidInvoices;
        this.SET_SPINNER_OVERLAY(false);
        if (cb) cb();
      });
    },
    viewTransaction(tx) {
      this.$xApp.triggerAction({
        command: "txDetails",
        tx: tx,
        account: this.xumm.account,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.xapp-page-payments {
  table {
    margin-bottom: 4rem;
    tr {
      td:first-child {
        font-size: 0.75rem;
        font-weight: bold;
      }
    }
  }
}
</style>
