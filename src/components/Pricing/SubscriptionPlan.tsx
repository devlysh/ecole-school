import { Card } from "@nextui-org/card";
import clsx from "clsx";

export interface SubscriptionPlanProps {
  id: string;
  className?: string;
  currency: string;
  name: string;
  discount?: number;
  price: number;
  numberOfClasses: number;
  onClick?: (id: string) => void;
  isSelected: boolean;
}

const DiscountBadge = ({ discount }: { discount: number }) => (
  <div className="absolute z-10 border border-black rounded bg-white -top-2 left-1/3 px-3">
    Get {discount}% off
  </div>
);

export const SubscriptionPlan = ({
  id,
  className,
  currency,
  name,
  discount,
  price,
  numberOfClasses,
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
      {discount && !isNaN(discount) && <DiscountBadge discount={discount} />}
      <Card
        className={clsx(
          "border-2 p-4 flex flex-row justify-between items-center z-0 box-content cursor-pointer",
          isSelected ? "border-purple-700" : "border-transparent"
        )}
      >
        <div className="flex flex-col">
          <div className="text-lg">{name}</div>
          <div className="text-xs text-gray-400">
            {(price / 100).toFixed(2)} {currency.toUpperCase()}
          </div>
        </div>
        {numberOfClasses && (
          <div>
            <span className="text-xl font-bold">
              {(price / 100 / numberOfClasses).toFixed(2)}{" "}
              {currency.toUpperCase()}
            </span>
            <span> / class</span>
          </div>
        )}
      </Card>
    </div>
  );
};
