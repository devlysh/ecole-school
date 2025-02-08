import { useCreditCountContext } from "@/providers/CreditCountProvider";

const CreditCountBadge = () => {
  const { creditCount } = useCreditCountContext();

  const creditWord =
    creditCount.toString().endsWith("1") &&
    !creditCount.toString().endsWith("11")
      ? "credit"
      : "credits";

  return (
    <div>
      {creditCount} {creditWord} left
    </div>
  );
};

export default CreditCountBadge;
