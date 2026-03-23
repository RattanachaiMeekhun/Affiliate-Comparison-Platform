import React, { AnchorHTMLAttributes } from 'react';

interface AffiliateLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  sourceName?: string;
  children: React.ReactNode;
}

const AffiliateLink: React.FC<AffiliateLinkProps> = ({ 
  href, 
  sourceName = 'Amazon', 
  children, 
  ...rest 
}) => {
  // We handle the affiliate tag wrapping directly on the backend, 
  // so this URL is already expected to be correct.
  // This component ensures SEO safety, target="_blank", and protects against tracking loss.
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Future tracking logic can go here (e.g., Google Analytics, Meta Pixel, or internal API call)
    // console.log(`Clicked affiliate link for: ${sourceName}`);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow noopener noreferrer"
      onClick={handleClick}
      {...rest}
    >
      {children}
    </a>
  );
};

export default AffiliateLink;
