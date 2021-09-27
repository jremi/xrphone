<template>
  <div id="page-signup-container">
    <div class="container">
      <div class="columns">
        <div class="column has-text-centered">
          <div class="is-size-3">I'm someone</div>
          <b-button
            class="has-text-weight-bold"
            type="is-dark"
            tag="router-link"
            to="/signup/regular"
            >who wants to pay invoices with XRP</b-button
          >
        </div>
        <div class="column has-text-centered">
          <div class="is-size-3">I'm a merchant</div>
          <b-button
            class="has-text-weight-bold"
            type="is-dark"
            tag="router-link"
            to="/signup/merchant"
            >who wants invoices paid with XRP</b-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PageSignUp",
};
</script>
