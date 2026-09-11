"use client";

import Image from "next/image";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

export function ShopGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState<string | null>(null);
  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(src)}
            className="card-premium group relative aspect-square overflow-hidden p-0 hover:-translate-y-1 hover:shadow-premium-lg"
          >
            <Image
              src={src}
              alt={`Photo ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Modal open={active !== null} onClose={() => setActive(null)} size="lg">
        {active && (
          <div className="relative aspect-[4/3] w-full bg-ink">
            <Image
              src={active}
              alt="Aperçu"
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        )}
      </Modal>
    </>
  );
}
