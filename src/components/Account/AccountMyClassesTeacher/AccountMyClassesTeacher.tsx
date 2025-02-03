"use client";

import React from "react";
import { useTeacherClasses } from "@/hooks/useTeacherClasses";
import AccountMyClassesTeacherTable from "./AccountMyClassesTeacherTable";

const AccountMyClassesTeacher = () => {
  const { classes, loading } = useTeacherClasses();

  return (
    <div>
      <h1>My Classes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <AccountMyClassesTeacherTable classes={classes} />
      )}
    </div>
  );
};

export default AccountMyClassesTeacher;
