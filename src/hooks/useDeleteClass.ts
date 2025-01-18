"use client";

import { useState } from "react";

const useDeleteClass = () => {
  const [deleteFutureOccurences, setDeleteFutureOccurences] = useState(false);

  return {
    deleteFutureOccurences,
    setDeleteFutureOccurences,
  };
};

export default useDeleteClass;
