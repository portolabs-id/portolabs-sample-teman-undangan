import Image from "next/image";
import Link from "next/link";

/**
 * Wordmark used in every header: the logo mark next to the product name,
 * set as one word with the two halves carrying the logo's two colours.
 */
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="brand landing__wordmark">
      <Image src="/logo.png" alt="" width={34} height={34} priority unoptimized />
      <span className="brand__name">
        <span className="brand__teman">teman</span><span className="brand__undangan">undangan</span>
      </span>
    </Link>
  );
}
