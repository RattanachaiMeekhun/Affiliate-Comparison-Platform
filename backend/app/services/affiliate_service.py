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
        
        # SiteStripe parameters fallback
        query_params['tag'] = [self.amazon_tag]
        query_params['linkCode'] = ['ll2']
        query_params['language'] = ['en_US']
        query_params['ref_'] = ['as_li_ss_tl']
        
        new_query = urllib.parse.urlencode(query_params, doseq=True)
        return urllib.parse.urlunparse(parsed_url._replace(query=new_query))

    def wrap_url(self, source_name: str, url: str) -> str:
        """
        Main entry point to wrap URLs based on their source.
        """
        if source_name.lower() == "amazon":
            return self.generate_amazon_affiliate_url(url)
        return url

    def generate_amazon_search_url(self, query: str) -> str:
        """
        Generates an Amazon search URL with the affiliate tag.
        Used as a fallback when a specific product DP link is not available.
        """
        encoded_query = urllib.parse.quote(query)
        base_url = "https://www.amazon.com/s"
        return f"{base_url}?k={encoded_query}&tag={self.amazon_tag}&linkCode=ll2&language=en_US&ref_=as_li_ss_tl"

affiliate_service = AffiliateService()
