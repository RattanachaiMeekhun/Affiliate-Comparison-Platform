import api from '@/util/axios';

export interface ComponentItem {
  id?: string;
  label: string;
  name: string;
  price: number;
  icon_key: string;
  affiliate_url?: string;
}

export interface SetBuilderRecommendation {
  title: string;
  subtitle: string;
  components: ComponentItem[];
  insight: string;
}

export interface SetBuilderResponse {
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
  custom_requirements?: string;
}

export async function fetchSetBuilderRecommendation(
  selections: Record<string, string>,
  currency: string,
  customRequirements?: string
): Promise<SetBuilderResponse> {
  const payload: SetBuilderPayload = {
    use_case: selections['use-case'] || '',
    budget: selections['budget'] || '',
    ecosystem: selections['ecosystem'] || '',
    storage: selections['storage'] || '',
    memory: selections['memory'] || '',
    currency,
    ...(customRequirements ? { custom_requirements: customRequirements } : {}),
  };

  const res = await api.post<SetBuilderResponse>('/api/setbuilder/recommend', payload);
  return res.data;
}
