import api from '@/util/axios';

export interface ComponentItem {
  label: string;
  name: string;
  price_usd: number;
  icon_key: string;
}

export interface SetBuilderRecommendation {
  title: string;
  subtitle: string;
  components: ComponentItem[];
  insight: string;
}

interface SetBuilderPayload {
  use_case: string;
  budget: string;
  ecosystem: string;
  storage: string;
  memory: string;
  currency: string;
}

export async function fetchSetBuilderRecommendation(
  selections: Record<string, string>,
  currency: string,
): Promise<SetBuilderRecommendation> {
  const payload: SetBuilderPayload = {
    use_case: selections['use-case'] || '',
    budget: selections['budget'] || '',
    ecosystem: selections['ecosystem'] || '',
    storage: selections['storage'] || '',
    memory: selections['memory'] || '',
    currency,
  };

  const res = await api.post<SetBuilderRecommendation>(
    '/api/setbuilder/recommend',
    payload,
  );
  return res.data;
}
