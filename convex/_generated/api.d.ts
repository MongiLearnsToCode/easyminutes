/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as check_free_limit from "../check_free_limit.js";
import type * as create_shareable_link from "../create_shareable_link.js";
import type * as gemini from "../gemini.js";
import type * as gemini_mutations from "../gemini_mutations.js";
import type * as get_analytics from "../get_analytics.js";
import type * as get_conversion_analytics from "../get_conversion_analytics.js";
import type * as get_latest_minutes from "../get_latest_minutes.js";
import type * as get_minutes_by_id from "../get_minutes_by_id.js";
import type * as get_minutes_versions from "../get_minutes_versions.js";
import type * as get_nps_analytics from "../get_nps_analytics.js";
import type * as get_repeat_usage_analytics from "../get_repeat_usage_analytics.js";
import type * as get_shared_minutes from "../get_shared_minutes.js";
import type * as get_user_profile from "../get_user_profile.js";
import type * as hello from "../hello.js";
import type * as http from "../http.js";
import type * as increment_free_generations from "../increment_free_generations.js";
import type * as save_edited_minutes from "../save_edited_minutes.js";
import type * as send_email from "../send_email.js";
import type * as track_nps_survey from "../track_nps_survey.js";
import type * as track_processing_time from "../track_processing_time.js";
import type * as track_subscription from "../track_subscription.js";
import type * as track_user_activity from "../track_user_activity.js";
import type * as transcribe_audio from "../transcribe_audio.js";
import type * as transcribe_audio_mutations from "../transcribe_audio_mutations.js";
import type * as update_pro_status from "../update_pro_status.js";
import type * as user from "../user.js";
import type * as user_profile from "../user_profile.js";
import type * as utils_meeting_minutes_validator from "../utils/meeting_minutes_validator.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  check_free_limit: typeof check_free_limit;
  create_shareable_link: typeof create_shareable_link;
  gemini: typeof gemini;
  gemini_mutations: typeof gemini_mutations;
  get_analytics: typeof get_analytics;
  get_conversion_analytics: typeof get_conversion_analytics;
  get_latest_minutes: typeof get_latest_minutes;
  get_minutes_by_id: typeof get_minutes_by_id;
  get_minutes_versions: typeof get_minutes_versions;
  get_nps_analytics: typeof get_nps_analytics;
  get_repeat_usage_analytics: typeof get_repeat_usage_analytics;
  get_shared_minutes: typeof get_shared_minutes;
  get_user_profile: typeof get_user_profile;
  hello: typeof hello;
  http: typeof http;
  increment_free_generations: typeof increment_free_generations;
  save_edited_minutes: typeof save_edited_minutes;
  send_email: typeof send_email;
  track_nps_survey: typeof track_nps_survey;
  track_processing_time: typeof track_processing_time;
  track_subscription: typeof track_subscription;
  track_user_activity: typeof track_user_activity;
  transcribe_audio: typeof transcribe_audio;
  transcribe_audio_mutations: typeof transcribe_audio_mutations;
  update_pro_status: typeof update_pro_status;
  user: typeof user;
  user_profile: typeof user_profile;
  "utils/meeting_minutes_validator": typeof utils_meeting_minutes_validator;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
