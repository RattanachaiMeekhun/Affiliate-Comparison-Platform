import urllib.parse

class AffiliateService:
    def __init__(self, amazon_tag: str = "stacknodes-20"):
        self.amazon_tag = amazon_tag

    def generate_amazon_affiliate_url(self, url: str) -> str:
        """
        Takes an Amazon URL and appends/replaces the affiliate tag.
        Handles standard amazon.com links.
        """
        parsed_url = urllib.parse.urlparse(url)
        query_params = urllib.parse.parse_qs(parsed_url.query)
        
        # Enforce stacknodes-20 tag
        query_params['tag'] = [self.amazon_tag]
        
        new_query = urllib.parse.urlencode(query_params, doseq=True)
        return urllib.parse.urlunparse(parsed_url._replace(query=new_query))

    def wrap_url(self, source_name: str, url: str) -> str:
        """
        Main entry point to wrap URLs based on their source.
        """
        if source_name.lower() == "amazon":
            return self.generate_amazon_affiliate_url(url)
        return url

affiliate_service = AffiliateService()
