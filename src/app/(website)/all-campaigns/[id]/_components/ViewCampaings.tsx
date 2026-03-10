"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface Donor {
  _id: string;
  studentId: string;
  donor: {
    name: string;
    email: string;
    mobile: string;
    country: string;
    city: string;
  };
  amount: number;
  createdAt: string;
}

interface Student {
  studentId: string;
  name: string;
  email: string;
  raisedAmount: number;
  others?: Record<string, string>;
}

interface CampaignApiResponse {
  _id: string;
  name: string;
  description: string;
  media: { url: string; public_id: string; _id: string }[];
  students: Student[];
  totalRaised: number;
  raiseGoal: string;
  createdBy: { _id: string; name: string; email: string; role: string };
  createdAt: string;
  donations: Donor[];
}

type Tab = "story" | "updates" | "donors";

function ViewCampaignSkeleton() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="mx-auto container px-4 py-[64px] sm:px-6">
        <div className="text-center mb-4 space-y-3">
          <Skeleton className="h-9 w-2/3 mx-auto" />
          <Skeleton className="h-4 w-1/3 mx-auto" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          <div className="flex-1 min-w-0">
            <div className="flex border-b border-gray-200 mb-5 justify-between px-10">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
            <Skeleton className="w-full mb-3" style={{ height: 540 }} />
            <div className="flex gap-2 mb-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-20 h-14 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-9 w-48 mb-4" />
            <div className="space-y-2 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="mb-6">
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="border border-[#ACACAC] rounded-xl p-4 flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div>
              <Skeleton className="h-5 w-28 mb-3" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-4 border border-[#ACACAC] px-4 rounded-md">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:w-96 mt-16">
            <div className="border border-gray-200 p-4 shadow-[0px_1px_17.4px_0px_#00000040]">
              <Skeleton className="h-14 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-40 mx-auto mb-6" />
              <Skeleton className="h-2 w-full rounded-full mb-2" />
              <div className="flex gap-3 mb-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-10 w-full rounded-lg mb-2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ViewCampaings() {
  const [activeTab, setActiveTab] = useState<Tab>("story");
  const [showFullStory, setShowFullStory] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const params = useParams();
  const id = params?.id;

  const { data: apiData, isLoading } = useQuery<CampaignApiResponse>({
    queryKey: ["singleCampaign", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/campaign/${id}`
      );
      const data = await res.json();
      return data?.data;
    },
    enabled: !!id,
  });

  const images =
    apiData?.media?.length
      ? apiData.media.map((m) => m.url)
      : ["/images/aboutbg.png"];

  const raised = apiData?.totalRaised ?? 0;
  const goal = Number(apiData?.raiseGoal) || 0;
  const progressPercent = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const fundedPercent = Math.round(progressPercent);

  const story = apiData?.description ?? "";
  const storyPreview = story.slice(0, 320);

  const students = apiData?.students ?? [];
  const donations = apiData?.donations ?? [];

  const topDonors = [...donations]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  if (isLoading) return <ViewCampaignSkeleton />;

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="mx-auto container px-4 py-[64px] sm:px-6">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-[36px] sm:text-[26px] font-semibold text-[#131313] leading-[150%] mb-2">
            {apiData?.name}
          </h1>
          <p className="text-xs text-gray-500 flex flex-wrap items-center justify-center gap-2">
            <span>Fundraising campaign by</span>
            <a href="#" className="text-blue-500 font-medium hover:underline">
              {apiData?.createdBy?.name}
            </a>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-5 justify-between px-10">
              {(["story", "updates", "donors"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-[24px] font-medium leading-[150%] capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "story" && (
              <div>
                {/* Main Image */}
                <div
                  className="overflow-hidden mb-3 bg-gray-100 relative"
                  style={{ height: 540 }}
                >
                  <Image
                    width={1200}
                    height={540}
                    src={images[activeImage]}
                    alt="Campaign"
                    className="w-full h-full object-cover"
                  />
                </div>

                {images.length > 1 && (
                  <div className="flex items-center gap-2 mb-6">
                    <button className="p-1 text-gray-400 hover:text-gray-600">‹</button>
                    <div className="flex gap-2 overflow-x-auto flex-1">
                      {images.slice(1).map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i + 1)}
                          className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                            activeImage === i + 1 ? "border-blue-500" : "border-transparent"
                          }`}
                        >
                          <Image width={120} height={80} src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">›</button>
                  </div>
                )}

                {/* Raised Amount */}
                <p className="text-[32px] font-semibold text-gray-900 mb-4">
                  US$ {raised.toLocaleString()}
                </p>

                {/* Story Text */}
                <div className="text-[20px] text-black leading-[180%] space-y-3 mb-3">
                  {(showFullStory ? story : storyPreview + "...")
                    .split("\n\n")
                    .map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                </div>

                <button
                  onClick={() => setShowFullStory((p) => !p)}
                  className="flex items-center gap-1 text-blue-500 text-sm font-medium hover:text-blue-700 transition-colors mb-8"
                >
                  {showFullStory ? "Show less" : "Show more"}
                  <span className={`transition-transform ${showFullStory ? "rotate-180" : ""}`}>⌄</span>
                </button>

                {/* Organizer */}
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Organizer</h3>
                  <div className="border border-[#ACACAC] rounded-xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg flex-shrink-0">
                      {apiData?.createdBy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-medium text-gray-800">{apiData?.createdBy?.name}</p>
                  </div>
                </div>

                {/* Students */}
                {students.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      Students ({students.length})
                    </h3>
                    <div className="space-y-3">
                      {students.map((student) => (
                        <div
                          key={student.studentId}
                          className="border border-[#ACACAC] rounded-xl px-4 py-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{student.name}</p>
                              <p className="text-xs text-gray-400">{student.email}</p>
                            </div>
                          </div>
                          {student.raisedAmount > 0 && (
                            <p className="text-sm font-semibold text-blue-600">
                              $ {student.raisedAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Donors */}
                {topDonors.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Top 3 Donors</h3>
                    <div className="space-y-0">
                      {topDonors.map((donor, index) => (
                        <div
                          key={donor._id}
                          className={`flex items-center justify-between py-4 mb-4 rounded-md ${
                            index < topDonors.length - 1 ? "border border-[#ACACAC] px-4" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                              {donor.donor.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{donor.donor.name}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(donor.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <p className="text-base font-semibold text-gray-900">
                            $ {donor.amount.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "updates" && (
              <div className="text-center py-16 text-gray-400 text-sm">
                No updates yet.
              </div>
            )}

            {/* Donors Tab */}
            {activeTab === "donors" && (
              <div>
                {donations.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    No donors yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {donations.map((donation) => (
                      <div
                        key={donation._id}
                        className="border border-[#ACACAC] rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                            {donation.donor.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{donation.donor.name}</p>
                            <p className="text-xs text-gray-400">
                              {donation.donor.city}, {donation.donor.country}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(donation.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-base font-semibold text-blue-600">
                          $ {donation.amount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:w-96 mt-16">
            <div className="border border-gray-200 p-4 !bg-[#FFFFFF] shadow-[0px_1px_17.4px_0px_#00000040]">
              <p className="lg:text-[48px] md:text-[38px] text-[30px] font-bold text-gray-900 mb-0.5 text-center">
                US$ {raised.toLocaleString()}
              </p>
              <p className="text-xs text-black mb-6 text-center">
                Raised of US$ {goal.toLocaleString()} goal
              </p>

              <div className="h-2 bg-gray-100 rounded-full mb-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <span>{fundedPercent}% Funded</span>
                <span>{donations.length} Donors</span>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors mb-2">
                Donate now
              </button>

              <button className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors">
                <span>🔗</span> Share with friends
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}