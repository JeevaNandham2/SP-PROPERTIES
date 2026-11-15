import { site as currentSite } from "@/content/site";

export const site = {
  ...currentSite,
  yearsOfExperience: currentSite.experienceYears,
};

export const fullAddress = currentSite.address.full;
export const mapsUrl = currentSite.mapsUrl;
