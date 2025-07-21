export interface Question {
  id: string
  question: string
  answer: string
  timestamp: string
  children: Question[]
}

export const mockQuestionData: { [key: string]: Question } = {
  "root": {
    id: "root",
    question: "How does artificial intelligence learn and adapt?",
    answer:
      "Artificial intelligence learns through various methods including supervised learning, unsupervised learning, and reinforcement learning. These systems process vast amounts of data to identify patterns, make predictions, and improve their performance over time through iterative training processes.",
    timestamp: new Date().toISOString(),
    children: [
      {
        id: "ml-vs-dl",
        question: "What's the difference between machine learning and deep learning?",
        answer:
          "Machine learning is a broader field that includes various algorithms for pattern recognition and prediction. Deep learning is a subset of machine learning that uses artificial neural networks with multiple layers to model complex patterns in data, particularly effective for tasks like image recognition and natural language processing.",
        timestamp: new Date().toISOString(),
        children: [
          {
            id: "neural-networks",
            question: "How do neural networks actually work?",
            answer:
              "Neural networks consist of interconnected nodes (neurons) organized in layers. Each connection has a weight, and neurons apply activation functions to determine their output. During training, the network adjusts these weights through backpropagation to minimize prediction errors.",
            timestamp: new Date().toISOString(),
            children: [
              {
                id: "backpropagation",
                question: "Can you explain backpropagation in simple terms?",
                answer:
                  "Backpropagation is like learning from mistakes. When a neural network makes a wrong prediction, it traces back through the network to see which connections contributed to the error, then adjusts those connections to reduce future mistakes. It's essentially how the network 'learns' from its errors.",
                timestamp: new Date().toISOString(),
                children: [],
              },
            ],
          },
          {
            id: "cnn-rnn",
            question: "What are CNNs and RNNs used for?",
            answer:
              "Convolutional Neural Networks (CNNs) excel at processing grid-like data such as images, using filters to detect features like edges and patterns. Recurrent Neural Networks (RNNs) are designed for sequential data like text or time series, maintaining memory of previous inputs to understand context.",
            timestamp: new Date().toISOString(),
            children: [],
          },
        ],
      },
      {
        id: "supervised-unsupervised",
        question: "What's the difference between supervised and unsupervised learning?",
        answer:
          "Supervised learning uses labeled training data where the correct answers are provided, like teaching with examples and solutions. Unsupervised learning finds patterns in data without labels, discovering hidden structures like customer segments or data clusters without being told what to look for.",
        timestamp: new Date().toISOString(),
        children: [],
      },
    ],
  },
  "project1": {
    id: "project1",
    question: "What are the key phases of software development life cycle (SDLC)?",
    answer:
      "The Software Development Life Cycle (SDLC) typically includes phases such as planning, requirements analysis, design, implementation, testing, deployment, and maintenance. Each phase has specific deliverables and processes to ensure a structured approach to software creation.",
    timestamp: new Date().toISOString(),
    children: [
      {
        id: "agile-vs-waterfall",
        question: "Compare Agile and Waterfall methodologies.",
        answer:
          "Waterfall is a linear, sequential approach where each phase must be completed before the next begins. Agile is an iterative and incremental approach, focusing on flexibility, collaboration, and rapid delivery of working software in short cycles (sprints).",
        timestamp: new Date().toISOString(),
        children: [],
      },
    ],
  },
  "project2": {
    id: "project2",
    question: "Explain the concept of cloud computing.",
    answer:
      "Cloud computing delivers on-demand computing services—from applications to storage and processing power—typically over the internet with a pay-as-you-go pricing model. It offers flexibility, scalability, and cost-efficiency by allowing users to access resources remotely.",
    timestamp: new Date().toISOString(),
    children: [
      {
        id: "iaas-paas-saas",
        question: "What are IaaS, PaaS, and SaaS?",
        answer:
          "IaaS (Infrastructure as a Service) provides virtualized computing resources over the internet. PaaS (Platform as a Service) offers a platform allowing customers to develop, run, and manage applications without the complexity of building and maintaining the infrastructure. SaaS (Software as a Service) delivers software applications over the internet, on demand and typically on a subscription basis.",
        timestamp: new Date().toISOString(),
        children: [],
      },
    ],
  },
};

export const initialQuestions = mockQuestionData["root"];

export function addQuestionTopic(newTopic: Question) {
  mockQuestionData[newTopic.id] = newTopic;
}
