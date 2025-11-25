// EnhancedBreadcrumbFocusView가 요구하는 데이터 타입
export interface ViewData {
  id: string;
  questionText: string;
  answerText: string;
  children: ViewData[];
  favorite: boolean; // 필수 속성
}

// API 응답 타입 수정: favorite 속성 추가
export interface TopicNode {
  topicId: string;
  topicName: string;
  createdAt: string;
  children: string[];
  favorite?: boolean; // API에서 올 수도 있고 안 올 수도 있으므로 옵셔널 처리
}

export interface QuestionNode {
  questionId: string;
  questionText: string;
  answerText: string;
  level: number;
  createdAt: string;
  children: string[];
  favorite?: boolean; // API에서 올 수도 있고 안 올 수도 있으므로 옵셔널 처리
}

export interface TopicTreeResponse {
  topic: string;
  nodes: { [id: string]: TopicNode | QuestionNode };
}

/**
 * API 응답 (TopicTreeResponse)을 EnhancedBreadcrumbFocusView가 사용하는
 * 재귀적인 ViewData 형태로 변환하는 함수.
 */
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
        favorite: false, // [수정] 변수 없이 사용된 것을 false로 고정
      };
    }

    let viewDataId = "";
    let questionText = "";
    let answerText = "";
    // [수정] favorite 값을 가져오거나 기본값 false 설정
    let isFavorite = false;

    // node 객체가 TopicNode인지 QuestionNode인지 구분
    if ("topicName" in node) {
      viewDataId = node.topicId;
      questionText = node.topicName;
      answerText = `토픽 질문: ${node.topicName}`;
      isFavorite = node.favorite || false;
    } else {
      viewDataId = node.questionId;
      questionText = node.questionText;
      answerText = node.answerText;
      isFavorite = node.favorite || false;
    }

    const children = node.children?.map(buildTree) || [];

    return {
      id: viewDataId,
      questionText: questionText,
      answerText: answerText,
      children,
      favorite: isFavorite, // [수정] ViewData에 필수인 favorite 속성 할당
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
    answerText: `토픽 질문: ${rootNode.topicName}`,
    children: [...directChildren, ...additionalChildren],
    favorite: rootNode.favorite || false, // [수정] 루트 노드에도 favorite 할당
  };
};