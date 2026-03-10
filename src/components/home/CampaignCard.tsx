'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

interface Campaign {
  id: string; // ✅ number → string
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  daysLeft?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {

  const progress =
    campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;

  const raisedFormatted = `$${campaign.raised.toLocaleString()}`;
  const goalFormatted = `$${campaign.goal.toLocaleString()}`;

  return (
    <Card className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      
      {/* Image Section */}
      <div className="relative w-full h-[257px] bg-gray-200 overflow-hidden">
        
        <Image
          src={campaign.image}
          alt={campaign.title}
          fill
          className="object-cover w-full h-full"
        />

        {campaign.daysLeft && (
          <div className="absolute top-4 right-4 bg-[#BDBDBD8F] text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
            {campaign.daysLeft}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-[#131313] mb-2 line-clamp-2">
          {campaign.title}
        </h3>

        <p className="text-sm text-[#424242] mb-4 line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-[#7DBAED]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-5">
            <p className="text-2xl font-semibold text-[#131313]">
              {raisedFormatted}
            </p>

            <Button className="bg-[#7DBAED] hover:bg-[#7DBAED]/90 h-[42px] rounded-full text-sm font-semibold">
              Donate
              <ArrowRight />
            </Button>
          </div>

          <p className="text-xs text-[#424242]">
            Raise goal {goalFormatted}
          </p>
        </div>

        {/* View Details Button */}
        <div className="mt-6">
          <Link href={`/all-campaigns/${campaign.id}`}>
            <button className="w-full border border-[#131313] text-gray-900 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </Card>
  );
}