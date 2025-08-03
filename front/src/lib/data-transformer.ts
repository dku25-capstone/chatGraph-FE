// EnhancedBreadcrumbFocusView가 요구하는 데이터 타입
export interface ViewData {
  id: string;
  questionText: string;
  answerText: string;
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
  questionText: string;
  answerText: string;
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
// API 응답에서 topicId를 루트 노드, 자식 노드를 ViewData 형태로 반환
export const transformApiDataToViewData = (
  apiData: TopicTreeResponse
): ViewData => {
  const { topic: rootId, nodes } = apiData;

  const rootNode = nodes[rootId] as TopicNode;

  // 해당 id의 노드를 찾아 ViewData로 반환
  const buildTree = (nodeId: string): ViewData => {
    const node = nodes[nodeId];

    if (!node) {
      console.error(`Missing node: ${nodeId}`);
      return {
        id: nodeId,
        questionText: "Error: Missing node",
        answerText: "This node is missing from the response.",
        children: [],
      };
    }

    let viewDataId = "";
    let questionText = "";
    let answerText = "";

    // node 객체가 TopicNode인지 QuestionNode인지 구분
    if ("topicName" in node) {
      viewDataId = node.topicId;
      questionText = node.topicName; // 토픽 제목
      answerText = `This is the root of the topic: ${node.topicName}`;
    } else {
      viewDataId = node.questionId;
      questionText = node.questionText;
      answerText = node.answerText;
    }

    const children = node.children?.map(buildTree) || [];

    return {
      id: viewDataId,
      questionText: questionText,
      answerText: answerText,
      children,
    };
  };

  // 1. topic.children로부터 트리 구성
  const directChildren = rootNode.children.map(buildTree);

  // 2. 명시적으로 children으로 연결되지 않았지만 level === 1 인 질문 노드 찾기
  const referencedIds = new Set(
    Object.values(nodes).flatMap((n) => ("children" in n ? n.children : []))
  );
  const additionalTopLevelQuestions = Object.values(nodes)
    .filter((node): node is QuestionNode => "questionId" in node)
    .filter((q) => q.level === 1 && !referencedIds.has(q.questionId));

  const additionalChildren = additionalTopLevelQuestions.map((q) =>
    buildTree(q.questionId)
  );

  return {
    id: rootNode.topicId,
    questionText: rootNode.topicName,
    answerText: `This is the root of the topic: ${rootNode.topicName}`,
    children: [...directChildren, ...additionalChildren],
  };
};
