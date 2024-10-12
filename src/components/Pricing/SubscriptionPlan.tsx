import { Card } from "@nextui-org/card";
import clsx from "clsx";

export interface SubscriptionPlanProps {
  id: string;
  className?: string;
  currency: string;
  description: string;
  discount?: string;
  price: string;
  pricePerClass: string;
  onClick?: (id: string) => void;
  isSelected: boolean;
}

const DiscountBadge = ({ discount }: { discount: string }) => (
  <div className="absolute z-10 border border-black rounded bg-white -top-2 left-1/3 px-3">
    {discount}
  </div>
);

export const SubscriptionPlan = ({
  id,
  className,
  currency,
  description,
  discount,
  price,
  pricePerClass,
  onClick,
  isSelected,
}: SubscriptionPlanProps) => {
  const handleClick = () => onClick && onClick(id);

  return (
    <div
      onClick={handleClick}
      className={clsx(className, "relative")}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
    >
      {discount && <DiscountBadge discount={discount} />}
      <Card
        className={clsx(
          "border-2 p-4 flex flex-row justify-between items-center z-0 box-content cursor-pointer",
          isSelected ? "border-purple-700" : "border-transparent"
        )}
      >
        <div className="flex flex-col">
          <div className="text-lg">{description}</div>
          <div className="text-xs text-gray-400">
            {price} {currency}
          </div>
        </div>
        <div>
          <span className="text-xl font-bold">
            {pricePerClass} {currency}
          </span>
          <span> / class</span>
        </div>
      </Card>
    </div>
  );
};
