import { api } from "@/lib/api";

/** PATCH /api/topics/{topicId} - 토픽명 수정 */

export interface PatchTopicRequest {
  newNodeName: string;
}

export interface PatchTopicResponse {
  nodeId: string;
  nodeType: string;
  nodeData: string;
}

export const patchTopic = async (
  topicId: string,
  data: PatchTopicRequest
): Promise<PatchTopicResponse> => {
  const response = await api.patch<PatchTopicResponse>(
    `/api/topics/${topicId}`,
    data
  );
    console.log(response.data)
  return response.data;
};

/** DELETE /api/topics/{topicId} - 토픽 삭제 */

export const deleteTopic = async (topicId: string): Promise<void> => {
  await api.delete(`/api/topics/${topicId}`);
};
