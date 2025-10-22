import React, { useEffect, useState } from "react";
import FaqSkeleton from "../../../components/FaqSkeleton.tsx";
import { getEntriesByType } from "../../../services/contentful.ts";
import Accordion from "../../../components/Accordion.tsx";

export interface FaqProps {}

type AccordionFaq = {
  question: string;
  answer: string;
};

const FaqComponent: React.FC<FaqProps> = ({}) => {
  const [faqs, setFaqs] = useState<AccordionFaq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getEntriesByType("faqAccordion");
        const transformedFaqs: AccordionFaq[] = response.map((item: any) => ({
          question: item.question || '',
          answer: item.answer || ''
        }));
        setFaqs(transformedFaqs.reverse());
      } catch (err) {
        console.error("Error fetching faqs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);


  if (loading) return <FaqSkeleton />



  return (
      <div className="mt-6">
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            title={faq.question}
            content={<>{faq.answer}</>}
          />
        ))}
      </div>
  )
};

export default FaqComponent;
