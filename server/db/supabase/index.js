const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_API_URL,
  process.env.SUPABASE_API_KEY_SECRET
);

/**
 * Create (Regular) XRPhone Account
 *
 * @param {string} phone_number - The phone number of regular XRPhone account holder.
 * @param {string} xrp_account - The XRP account number of account holder.
 * @param {string} xrpl_network - The XRPL network for XRP account number of account holder.
 * @param {string} xumm_user_token - The XUMM wallet user token of account holder.
 * @returns {Promise} - Promise object representing created regular XRPhone account
 */
const createRegularXrphoneAccount = async (
  phone_number,
  xrp_account,
  xrpl_network,
  xumm_user_token
) =>
  await supabase.from("account_regular").insert([
    {
      phone_number,
      xrp_account,
      xrpl_network,
      xumm_user_token,
    },
  ]);

/**
 * Create (Merchant) XRPhone Account
 *
 * @param {string} phone_number - The phone number of merchant XRPhone account holder.
 * @param {string} xrp_account - The XRP account number of account holder.
 * @param {string} destination_tag - The (optional) destination tag of account if on CEX.
 * @param {string} xrpl_network - The XRPL network for XRP account number of account holder.
 * @param {Object} app_integration - The app integration used with merchant XRPhone account.
 * @param {string} app_integration.id - The identifier of the app integration.
 * @param {string} app_integration.access_token - The oAuth access token of the app integration.
 * @param {string} app_integration.refresh_token - The oAuth refresh token of the app integration.
 * @returns {Promise} - Promise object representing created merchant XRPhone account
 */
const createMerchantXrphoneAccount = async (
  phone_number,
  xrp_account,
  destination_tag,
  xrpl_network,
  app_integration
) =>
  await supabase.from("account_merchant").insert([
    {
      phone_number,
      xrp_account,
      destination_tag,
      xrpl_network,
      app_integration,
    },
  ]);

/**
 * Update (Regular) XRPhone Account
 *
 * @param {string} phone_number - The phone number of regular XRPhone account holder.
 * @param {Object} payload - The columns to update for the regular XRPhone account.
 * @returns {Promise} - Promise object representing regular XRPhone account
 */
const updateRegularXrphoneAccount = async (phone_number, payload) =>
  await supabase
    .from("account_regular")
    .update(payload)
    .single()
    .eq("phone_number", phone_number);

/**
 * Update (Merchant) XRPhone Account
 *
 * @param {string} phone_number - The phone number of merchant XRPhone account holder.
 * @param {Object} payload - The columns to update for the merchant XRPhone account.
 * @returns {Promise} - Promise object representing merchant XRPhone account
 */
const updateMerchantXrphoneAccount = async (phone_number, payload) =>
  await supabase
    .from("account_merchant")
    .update(payload)
    .single()
    .eq("phone_number", phone_number);

/**
 * Lookup (Regular) XRPhone Account *by XRP Address*
 *
 * @param {string} xrp_account - The xrp account of regular XRPhone account holder.
 * @returns {Promise} - Promise object representing regular XRPhone account
 */
const lookupRegularXrphoneAccountByXrpAddress = async (
  xrp_account,
  xrpl_network
) =>
  await supabase
    .from("account_regular")
    .select()
    .single()
    .match({ xrp_account: xrp_account, xrpl_network: xrpl_network });

/**
 * Lookup (Merchant) XRPhone Account *by XRP Address*
 *
 * @param {string} xrp_account - The xrp account of regular XRPhone account holder.
 * @returns {Promise} - Promise object representing regular XRPhone account
 */
const lookupMerchantXrphoneAccountByXrpAddress = async (
  xrp_account,
  xrpl_network
) =>
  await supabase
    .from("account_merchant")
    .select()
    .single()
    .match({ xrp_account: xrp_account, xrpl_network: xrpl_network });

/**
 * Lookup (Regular) XRPhone Account
 *
 * @param {string} phone_number - The phone number of regular XRPhone account holder.
 * @returns {Promise} - Promise object representing regular XRPhone account
 */
const lookupRegularXrphoneAccount = async (phone_number) =>
  await supabase
    .from("account_regular")
    .select()
    .single()
    .eq("phone_number", phone_number);

/**
 * Lookup (Merchant) XRPhone Account
 *
 * @param {string} phone_number - The phone number of merchant XRPhone account holder.
 * @returns {Promise} - Promise object representing merchant XRPhone account
 */
const lookupMerchantXrphoneAccount = async (phone_number) => {
  return await supabase
    .from("account_merchant")
    .select()
    .single()
    .eq("phone_number", phone_number);
};

/**
 * Lookup (Merchant) XRPhone Account *by Quickbooks Realm Id*
 *
 * @param {string} realm_id - The Quickbooks realm id of merchant XRPhone account holder.
 * @returns {Promise} - Promise object representing merchant XRPhone account
 */
const lookupMerchantXrphoneAccountByQuickbooksRealmId = async (realm_id) => {
  return await supabase
    .from("account_merchant")
    .select()
    .single()
    .eq("app_integration->>realm_id", realm_id);
}

/**
 * Delete (Regular) XRPhone Account
 *
 * @param {string} phone_number - The phone number of merchant XRPhone account holder.
 * @returns {Promise} - Promise object representing deleted regular XRPhone account
 */
const deleteRegularXrphoneAccount = async (phone_number) =>
  await supabase
    .from("account_regular")
    .delete()
    .eq("phone_number", phone_number);

/**
 * Delete (Merchant) XRPhone Account
 *
 * @param {string} phone_number - The phone number of merchant XRPhone account holder.
 * @returns {Promise} - Promise object representing merchant XRPhone account
 */
const deleteMerchantXrphoneAccount = async (phone_number) =>
  await supabase
    .from("account_merchant")
    .delete()
    .eq("phone_number", phone_number);


/**
 * Lookup custom external sandboxed XRPhone developer app integrations by merchant number
 *
 * @param {string} appDebugMerchantNumber - (Required) merchant phone number associated with developer sandbox application for testing/debugging
 * @returns {Promise} - Promise object representing custom external XRPhone developer sandboxed app integrations.
 */
const lookupDeveloperAppsSandboxedByMerchantNumber = async (appDebugMerchantNumber) =>
  await supabase
    .from("devportal_application")
    .select()
    .match({
      appIsSandboxed: true,
      appDebugMerchantNumber
    });

/**
 * Lookup custom external listed XRPhone developer app integrations
 *
 * @returns {Promise} - Promise object representing custom external XRPhone developer listed app integrations.
 */
const lookupDeveloperAppsListed = async () =>
  await supabase
    .from("devportal_application")
    .select()
    .eq("appIsListed", true);

/**
 * Lookup custom external XRPhone developer app integrations by app id
 *
 * @returns {Promise} - Promise object representing custom external XRPhone developer listed app integration.
 */
const lookupDeveloperAppById = async (id) =>
  await supabase
    .from("devportal_application")
    .select()
    .single()
    .eq("id", id);

module.exports = {
  createRegularXrphoneAccount,
  createMerchantXrphoneAccount,
  updateRegularXrphoneAccount,
  updateMerchantXrphoneAccount,
  lookupRegularXrphoneAccountByXrpAddress,
  lookupMerchantXrphoneAccountByXrpAddress,
  lookupRegularXrphoneAccount,
  lookupMerchantXrphoneAccount,
  lookupMerchantXrphoneAccountByQuickbooksRealmId,
  deleteRegularXrphoneAccount,
  deleteMerchantXrphoneAccount,
  lookupDeveloperAppsSandboxedByMerchantNumber,
  lookupDeveloperAppsListed,
  lookupDeveloperAppById
};
