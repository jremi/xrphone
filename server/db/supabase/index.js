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
  xrpl_network,
  app_integration
) =>
  await supabase.from("account_merchant").insert([
    {
      phone_number,
      xrp_account,
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
const lookupMerchantXrphoneAccount = async (phone_number) =>
  await supabase
    .from("account_merchant")
    .select()
    .single()
    .eq("phone_number", phone_number);

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

module.exports = {
  createRegularXrphoneAccount,
  createMerchantXrphoneAccount,
  updateRegularXrphoneAccount,
  updateMerchantXrphoneAccount,
  lookupRegularXrphoneAccount,
  lookupMerchantXrphoneAccount,
  deleteRegularXrphoneAccount,
  deleteMerchantXrphoneAccount,
};
