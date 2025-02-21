import mailchimp from "@mailchimp/mailchimp_marketing";
import dotenv from "dotenv";

dotenv.config();

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX, 
});

export default mailchimp;