// mock_data/careers.js
// Mock career details (replace with DB later)

const careers = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    group: "Developer",
    intro:
      "A Software Engineer designs, builds, tests, and maintains software systems. They turn requirements into reliable products by writing clean code, collaborating with teams, and improving systems over time.",
    sections: [
      {
        title: "What Software Engineers do",
        bullets: [
          "Design and implement features based on user and business needs",
          "Write, test, and debug code to ensure quality and reliability",
          "Review code and collaborate with teammates to improve maintainability",
          "Optimize performance and fix bugs in production",
        ],
      },
    ],
  },

  {
    id: "front-end-developer",
    title: "Front-end Developer",
    group: "Developer",
    intro:
      "A Front-end Developer builds user interfaces for web applications. They focus on usability, performance, and accessibility to deliver smooth experiences across devices.",
    sections: [
      {
        title: "What Front-end Developers do",
        bullets: [
          "Implement UI from designs using HTML, CSS, and JavaScript",
          "Build reusable components and manage UI state",
          "Ensure responsive layouts and cross-browser compatibility",
          "Improve performance and accessibility (a11y)",
        ],
      },
    ],
  },

  {
    id: "data-analyst",
    title: "Data Analyst",
    group: "Data",
    intro:
      "A Data Analyst turns raw data into insights that support business decisions. They explore data, create reports and dashboards, and communicate findings clearly to stakeholders.",
    sections: [
      {
        title: "What Data Analysts do",
        bullets: [
          "Collect, clean, and validate data from different sources",
          "Analyze trends and patterns using statistics and visualization",
          "Build dashboards and reports for stakeholders",
          "Present insights and recommendations clearly",
        ],
      },
    ],
  },

  {
    id: "data-scientist",
    title: "Data Scientist",
    group: "Data",
    intro:
      "A Data Scientist uses data, statistics, and machine learning to build predictive models and generate insights. They design experiments, evaluate models, and translate results into business impact.",
    sections: [
      {
        title: "What Data Scientists do",
        bullets: [
          "Explore data and engineer features for modeling",
          "Train and evaluate machine learning models",
          "Design experiments and validate hypotheses",
          "Communicate results, limitations, and recommendations",
        ],
      },
    ],
  },

  {
    id: "data-engineer",
    title: "Data Engineer",
    group: "Data",
    intro:
      "A Data Engineer designs, builds, and manages the infrastructure for storing, processing, and accessing data. The focus is on delivering high-quality data that can be used effectively for analytics and decision-making.",
    sections: [
      {
        title: "Responsibilities",
        bullets: [
          "Design and develop data infrastructure (databases, data warehouses, and data lakes).",
          "Use tools such as Hadoop, Spark, and NoSQL databases to manage large-scale data.",
          "Build and maintain ETL processes to extract, transform, and load data from multiple sources.",
          "Use data integration tools such as Apache NiFi, Talend, and Informatica.",
          "Develop and manage big data processing systems (e.g., Hadoop, Spark).",
          "Work with big data technologies and distributed processing.",
          "Set up and maintain monitoring systems to ensure data systems run normally and detect issues quickly.",
          "Use monitoring tools such as Prometheus, Grafana, and Nagios.",
          "Improve and maintain data security, including access control and encryption.",
          "Collaborate with Data Scientists, Analysts, and other development teams to deliver reliable datasets.",
          "Provide technical support to other teams for using data and existing tools.",
          "Optimize ETL performance and storage systems for faster and more efficient processing.",
          "Monitor and tune database performance and processing systems.",
        ],
      },
      {
        title: "Required Skills",
        bullets: [
          "Programming skills in relevant languages such as Python, Java, or Scala.",
          "Ability to write code for building and managing ETL pipelines.",
          "Strong knowledge of relational databases and NoSQL systems.",
          "Ability to write complex SQL queries.",
          "Hands-on experience with databases such as PostgreSQL, MySQL, and MongoDB.",
          "Experience designing and developing ETL processes for integrating data from multiple sources.",
          "Familiarity with tools such as Apache Airflow, Talend, and AWS Glue.",
          "Expertise in big data tools such as Hadoop, Spark, and Kafka.",
          "Understanding of distributed computing concepts.",
          "Monitoring and maintenance skills using Prometheus, Grafana, and Nagios.",
          "Knowledge of data security practices: permissions, access control, and encryption.",
          "Strong communication skills to collaborate and explain technical topics clearly.",
        ],
      },
      {
        title: "Preparation & Career Growth",
        bullets: [
          "Earn a bachelor’s degree in Computer Science, Software Engineering, Information Systems, or related fields.",
          "Learn through self-study or online courses focused on data engineering and data management.",
          "Gain internship/work experience related to data systems, software development, or analytics.",
          "Build personal projects and a portfolio to demonstrate skills and real outputs.",
          "Keep learning by following trends and joining communities, forums, and conferences.",
        ],
      },
      {
        title: "Further Development & Recommendations",
        bullets: [
          "Learn modern tools such as Kafka, Flink, and Druid to improve efficiency.",
          "Learn cloud platforms and data services (AWS, GCP, Azure).",
          "Improve visualization skills with tools like Tableau and Power BI.",
          "Strengthen security skills: encryption and access management.",
          "Consider certifications such as Google Cloud Professional Data Engineer or AWS specialty certifications.",
        ],
      },
    ],
  },
];

export default careers;
