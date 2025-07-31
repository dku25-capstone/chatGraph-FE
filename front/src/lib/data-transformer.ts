
// EnhancedBreadcrumbFocusView가 요구하는 데이터 타입
export interface ViewData {
  id: string;
  question: string;
  answer: string;
  children: ViewData[];
}

// API 응답 타입
export interface TopicNode {
  topicId: string;
  topicName: string;
  createdAt: string;
  children: string[];
}

export interface QuestionNode {
  questionId: string;
  question: string;
  answer: string;
  level: number;
  createdAt: string;
  children: string[];
}

export interface TopicTreeResponse {
  topic: string;
  nodes: { [id: string]: TopicNode | QuestionNode };
}

/**
 * API 응답 (TopicTreeResponse)을 EnhancedBreadcrumbFocusView가 사용하는
 * 재귀적인 ViewData 형태로 변환하는 함수.
 */
export const transformApiDataToViewData = (apiData: TopicTreeResponse): ViewData => {
  const { topic: rootId, nodes } = apiData;

  const buildTree = (nodeId: string): ViewData => {
    const node = nodes[nodeId];

    if (!node) {
      console.error(`Node with ID ${nodeId} not found in API response. Returning empty ViewData. This might indicate a data inconsistency where a child node is referenced but not provided.`);
      return {
        id: nodeId,
        question: "Error: Node not found",
        answer: "This node could not be loaded due to missing data.",
        children: [],
      };
    }

    let questionText = '';
    let answerText = '';
    let viewDataId = '';

    if ('topicName' in node) { // TopicNode
      questionText = node.topicName;
      answerText = `This is the root of the topic: ${node.topicName}`;
      viewDataId = node.topicId;
    } else { // QuestionNode
      questionText = node.question;
      answerText = node.answer;
      viewDataId = node.questionId;
    }

    const children = ('children' in node && node.children)
      ? node.children.map(buildTree).filter(Boolean) // Filter out null children
      : [];

    return {
      id: viewDataId,
      question: questionText,
      answer: answerText,
      children: children,
    };
  };

  return buildTree(rootId);
};
