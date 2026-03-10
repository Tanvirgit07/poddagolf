"use client";

import Link from "next/link";
import { CampaignCard } from "./CampaignCard";
import { useQuery } from "@tanstack/react-query";

interface Media {
  url: string;
}

interface CampaignApi {
  _id: string;
  name: string;
  description: string;
  media: Media[];
  totalRaised: number;
  raiseGoal: string;
}

interface CampaignUI {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  daysLeft?: string;
}

export function CampaignsSection() {
  const { data: campaignData, isLoading } = useQuery<CampaignApi[]>({
    queryKey: ["campaign"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/campaign`
      );

      const data = await res.json();
      return data?.data?.campaigns;
    },
  });

  const campaigns: CampaignUI[] =
    campaignData?.map((item) => ({
      id: item._id,
      title: item.name,
      description: item.description,
      image:
        item.media?.length > 0
          ? item.media[0].url
          : "/images/damoImage.jpg",
      raised: item.totalRaised ?? 0,
      goal: Number(item.raiseGoal) || 0,
      daysLeft: "Expired in 7days",
    })) || [];

  return (
    <section
      id="campaigns"
      className="py-12 sm:py-16 lg:py-24 bg-background my-3"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-[30px] sm:text-[38px] lg:text-[48px] font-medium text-foreground">
            Current Campaigns
          </h2>

          <p className="mt-4 text-base sm:text-lg text-foreground/70">
            From emergency relief to long-term development projects, your help
            can make a crucial difference.
          </p>
        </div>

        <div className="flex justify-end items-center mt-10">
          <Link
            href="/all-campaigns"
            className="text-gray-900 px-6 rounded-md font-medium  transition-colors text-center whitespace-nowrap"
          >
            See All
          </Link>
        </div>

        {/* Campaign Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? "Loading..."
            : campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
        </div>
      </div>
    </section>
  );
}