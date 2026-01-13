import { useState, useCallback, useRef } from "react";
import { ViewData } from "@/lib/data-transformer";
import { toast } from "sonner";

export type ModifyMode =
    | "IDLE"
    | "SELECT_CHILD"
    | "SELECT_PARENT"
    | "SELECT_NODE_TO_MOVE_OTHER"
    | "SELECT_NODE_TO_SPLIT"
    | "SELECT_NODE_TO_SHARE";

export interface ShareRequest {
    nodeToShare: ViewData;
}

export interface ReparentRequest {
    movedNode: ViewData;
    newParentNode: ViewData;
}

export interface SplitRequest {
    nodeToSplit: ViewData;
}

export interface MoveToTopicRequest {
    movedNode: ViewData;
    targetTopic: { id: string; name: string };
    targetParentId: string;
    targetParentNode: { id: string; name: string };
}

export const useTreeInteraction = () => {
    const [prompt, setPrompt] = useState("");
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [selectedNode, setSelectedNode] = useState<ViewData | null>(null);
    const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
    const [modifyMode, setModifyMode] = useState<ModifyMode>("IDLE");
    const [nodeToMove, setNodeToMove] = useState<ViewData | null>(null);
    const [reparentRequest, setReparentRequest] = useState<ReparentRequest | null>(null);
    const [isTopicSelectorOpen, setIsTopicSelectorOpen] = useState(false);
    const [moveToTopicRequest, setMoveTopicRequest] = useState<MoveToTopicRequest | null>(null);
    const [splitRequest, setSplitRequest] = useState<SplitRequest | null>(null);
    const [shareRequest, setShareRequest] = useState<ShareRequest | null>(null);

    const startShareMode = useCallback(() => {
        setModifyMode("SELECT_NODE_TO_SHARE");
        toast.info("공유할 '첫 번째 질문'을 선택하세요.");
    }, []);

    const startModifyMode = useCallback(() => {
        setModifyMode("SELECT_CHILD");
        toast.info("관계를 수정할 노드를 선택하세요.");
    }, []);

    const startSplitMode = useCallback(() => {
        setModifyMode("SELECT_NODE_TO_SPLIT");
        toast.info("새로운 토픽으로 분리할 시작 노드를 선택하세요.");
    }, []);

    const moveToOtherMode = useCallback(() => {
        setModifyMode("SELECT_NODE_TO_MOVE_OTHER");
        toast.info("다른 토픽으로 이동할 질문을 선택하세요.");
    }, []);

    const cancelModifyMode = useCallback(() => {
        setModifyMode("IDLE");
        setNodeToMove(null);
        setReparentRequest(null);
        setSplitRequest(null);
        setIsTopicSelectorOpen(false);
        setMoveTopicRequest(null);
        toast.dismiss();
    }, []);

    return {
        prompt,
        setPrompt,
        scrollAreaRef,
        selectedNode,
        setSelectedNode,
        focusedNodeId,
        setFocusedNodeId,
        modifyMode,
        setModifyMode,
        nodeToMove,
        setNodeToMove,
        reparentRequest,
        setReparentRequest,
        isTopicSelectorOpen,
        setIsTopicSelectorOpen,
        moveToTopicRequest,
        setMoveTopicRequest,
        splitRequest,
        setSplitRequest,
        shareRequest,
        setShareRequest,
        startShareMode,
        startModifyMode,
        startSplitMode,
        moveToOtherMode,
        cancelModifyMode,
    };
};
