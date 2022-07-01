<template>
    <div class="xumm-pay-modal modal-card" style="width: auto">
        <header class="modal-card-head">
            <p class="modal-card-title has-text-centered"><b>Pay with Xumm Wallet</b></p>
        </header>
        <section class="modal-card-body">
            <img :src="qr_png" />
        </section>
        <footer class="modal-card-foot">
            <!-- <b-button label="Close" @click="$parent.close()" /> -->
            <div class="payment-status font-weight-bold has-text-centered">
                <b>{{ status }}</b>
                <img v-if="showSpinner" class="spinner-logo ml-2" src="@/assets/images/spinners/circles.svg" />
            </div>
        </footer>
    </div>
</template>

<script>
export default {
    name: "XummPayModal",
    props: {
        qr_png: {
            type: String,
            required: true
        },
        websocket_status: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            showSpinner: true,
            status: 'Waiting for QR Code Scan'
        }
    },
    mounted() {
        const socket = new WebSocket(this.websocket_status);
        socket.onmessage = (event) => {
            if (event && event.data) {
                const data = JSON.parse(event.data);
                let message;
                if (data.opened) {
                    message = 'Xumm Wallet Opened'
                } else if (data.signed && data.txid !== "") {
                    message = "Payment Successful";
                    socket.close();
                    setTimeout(() => {
                        this.showSpinner = false;
                        this.$parent.close();
                        this.$emit('paid');
                    }, 1000);
                }
                else if (!data.signed && data.txid === "") {
                    message = 'Payment Cancelled';
                    socket.close();
                    setTimeout(() => {
                        this.$emit('close');
                    }, 1000);
                }
                if (message) {
                    this.status = message;
                }
            }
        };
    },
}
</script>

<style lang="scss" scoped>
.payment-status {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    .spinner-logo {
        width: 22px;
    }
}
</style>