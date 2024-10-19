import { Button } from "@nextui-org/button";
import Image from "next/image";

interface TextSlideProps {
  title?: string;
  text: string;
  image?: { url: string; width: number; height: number };
  onNext: () => void;
}

const TextSlide: React.FC<TextSlideProps> = ({
  title,
  text,
  image,
  onNext,
}) => (
  <div className="text-slide">
    {title && <h2>{title}</h2>}
    <p>{text}</p>
    {image && (
      <Image
        src={`/${image.url}`}
        alt={text}
        width={image.width}
        height={image.height}
      />
    )}
    <Button onClick={onNext}>Next</Button>
  </div>
);

export default TextSlide;
