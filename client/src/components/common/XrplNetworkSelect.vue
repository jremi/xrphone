<template>
  <div class="xrpl-network-select-container">
    <b-select
      v-model="xrplNetwork"
      placeholder="Select XRPL Network"
      :size="size"
      icon="network-wired"
      expanded
    >
      <optgroup label="XRPL Network" class="has-text-weight-bold">
        <option value="MAINNET">Mainnet</option>
        <option value="TESTNET">Testnet</option>
      </optgroup>
    </b-select>
  </div>
</template>

<script>
export default {
  name: "XrplNetworkSelect",
  props: {
    value: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: false,
      default: 'is-medium'
    }
  },
  computed: {
    xrplNetwork: {
      get() {
        return this.value;
      },
      set(selectedValue) {
        this.$emit("input", selectedValue);
      },
    },
  },
};
</script>
