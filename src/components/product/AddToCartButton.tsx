"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/useCart";
import { Button } from "@/components/ui/Button";

type AddToCartButtonProps = {
  productId: string;
  /** "buy" adds the template and moves straight to the cart. */
  mode?: "buy" | "cart";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function AddToCartButton({
  productId,
  mode = "buy",
  size = "lg",
  className,
}: AddToCartButtonProps) {
  const { add } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  if (mode === "buy") {
    return (
      <Button
        size={size}
        className={className}
        onClick={() => {
          add(productId);
          router.push("/cart");
        }}
      >
        Buy Template
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant="outline"
      className={className}
      onClick={() => {
        add(productId);
        setAdded(true);
      }}
    >
      {added ? "Added to Cart" : "Add to Cart"}
    </Button>
  );
}
