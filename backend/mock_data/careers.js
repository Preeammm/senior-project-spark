// mock_data/careers.js
// Mock career details (replace with DB later)

const careers = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    group: "Developer",
    intro:
      "A Software Engineer is a specialist who designs, develops, tests, and maintains software using engineering principles and modern technologies to build systems that meet user and organizational needs.",
    sections: [
      {
        title: "What Software Engineers do",
        bullets: [
          "Design software architecture and implement software based on user and business requirements.",
          "Test and debug software to ensure correctness and reliability.",
          "Maintain and update software to stay compatible with changing platforms and hardware.",
          "Work with users and stakeholders to gather and analyze software requirements.",
          "Plan and manage software projects to meet deadlines and budget constraints.",
          "Collaborate with developers, designers, testers, and users to align delivery with project goals.",
          "Integrate software with other systems and services for efficient interoperability.",
        ],
      },
      {
        title: "Required Skills",
        bullets: [
          "Programming skills in languages such as Java, Python, C++, and JavaScript.",
          "Knowledge of software design and architecture principles such as OOP, MVC, and Microservices.",
          "Testing and debugging skills.",
          "Knowledge of relational and NoSQL databases.",
          "Strong analytical thinking and problem-solving.",
          "Software project planning and management ability.",
          "Communication and collaboration skills for cross-functional teamwork.",
        ],
      },
      {
        title: "Preparation & Career Growth",
        bullets: [
          "Complete a bachelor’s degree in Computer Science, Software Engineering, Computer Engineering, or related fields.",
          "Learn through self-study or online courses focused on software development.",
          "Gain internship/work experience in software development roles.",
          "Build personal projects and a portfolio to demonstrate practical ability.",
          "Keep learning continuously by following software trends and best practices.",
          "Join online communities, forums, and conferences in software engineering.",
        ],
      },
      {
        title: "Further Development & Recommendations",
        bullets: [
          "Learn additional frameworks and tools such as React, Angular, Spring Boot, and Django.",
          "Learn mobile and web application development to build cross-platform solutions.",
          "Develop data analysis skills to support data-driven engineering decisions.",
          "Improve software security knowledge and secure coding practices.",
          "Build a professional network by joining software communities and developer groups.",
          "Create personal projects regularly to strengthen skills and portfolio quality.",
          "Pursue certifications such as Certified Scrum Developer (CSD) and Microsoft Certified: Azure Developer Associate.",
        ],
      },
    ],
  },

  {
    id: "front-end-developer",
    title: "Front-end Developer",
    group: "Developer",
    intro:
      "A Front-end Developer is a specialist in building website and application interfaces, focusing on User Interface (UI) and User Experience (UX). They use web technologies such as HTML, CSS, and JavaScript to build practical, user-friendly web pages.",
    sections: [
      {
        title: "What Front-end Developers do",
        bullets: [
          "Develop and design UI using HTML, CSS, and JavaScript.",
          "Improve UX so websites and applications are smooth and easy to use.",
          "Collaborate with UI/UX designers to turn design mockups into working code.",
          "Test and debug across browsers and devices.",
          "Optimize loading speed and runtime performance.",
          "Maintain and update code to support modern technologies.",
          "Work with back-end developers to connect UI with APIs and databases.",
        ],
      },
      {
        title: "Required Skills",
        bullets: [
          "Strong HTML, CSS, and JavaScript fundamentals.",
          "Experience with frameworks/libraries such as React, Angular, or Vue.",
          "Understanding of UI/UX principles and design quality.",
          "Responsive design skills for different screen sizes and devices.",
          "Testing and debugging skills.",
          "Familiarity with development workflows and tools such as Git, Webpack, Babel, and npm/yarn.",
          "Basic SEO knowledge for improving discoverability and accessibility.",
          "Communication and teamwork skills.",
        ],
      },
      {
        title: "Preparation & Career Growth",
        bullets: [
          "Complete a bachelor’s degree in Computer Science, Computer Engineering, or related fields.",
          "Learn through self-study or web development online courses.",
          "Gain internship/work experience in web development roles.",
          "Build personal projects and a portfolio to demonstrate practical ability.",
          "Keep learning continuously by following trends in web technologies.",
          "Join online communities, forums, and conferences in web development.",
        ],
      },
      {
        title: "Further Development & Recommendations",
        bullets: [
          "Learn additional frameworks/libraries to broaden development capability.",
          "Study Mobile-first development and Progressive Web Apps (PWA).",
          "Learn back-end fundamentals to improve full-stack collaboration.",
          "Strengthen design skills with tools such as Figma, Sketch, and Adobe XD.",
          "Build a professional network through web developer communities.",
          "Create personal projects regularly to improve skills and portfolio quality.",
          "Use online courses, articles, videos, and books to keep improving.",
        ],
      },
    ],
  },

  {
    id: "data-analyst",
    title: "Data Analyst",
    group: "Data",
    intro:
      "A Data Analyst is a specialist who collects, analyzes, and interprets data to support business and operational decision-making. They use tools and analytical techniques to identify trends, patterns, and relationships in data.",
    sections: [
      {
        title: "What Data Analysts do",
        bullets: [
          "Collect data from sources such as databases, websites, and internal systems.",
          "Use ETL processes/tools to extract, transform, and load data for analysis.",
          "Validate data quality and completeness.",
          "Handle missing, duplicated, or incorrect data.",
          "Analyze trends and patterns using tools such as SQL, Excel, Python, and R.",
          "Create analytical summaries and reports.",
          "Build visualizations such as charts and dashboards with tools like Tableau, Power BI, Matplotlib, and Seaborn.",
          "Present findings and recommendations clearly to teams and stakeholders.",
          "Support business decisions with data-driven insights.",
          "Suggest improvements to processes and strategy based on analysis.",
          "Monitor outcomes and evaluate whether recommendations are effective.",
          "Continuously improve analysis and reporting from observed results.",
        ],
      },
      {
        title: "Required Skills",
        bullets: [
          "Programming skills in Python, R, and SQL.",
          "Practical use of data libraries such as pandas, NumPy, and scikit-learn.",
          "Hands-on experience with analysis tools such as Excel, Tableau, Power BI, and Looker Studio.",
          "Strong SQL skills for querying data from databases.",
          "Analytical thinking and structured problem-solving.",
          "Understanding of core statistics and data analysis methods.",
          "Ability to design clear and meaningful visualizations.",
          "Communication skills for reporting and presenting insights effectively.",
          "Business understanding to connect analysis with business impact and decisions.",
        ],
      },
      {
        title: "Preparation & Career Growth",
        bullets: [
          "Complete a bachelor’s degree in Computer Science, Statistics, Mathematics, Business, or a related field.",
          "Use self-study and online courses focused on data analytics.",
          "Gain internship/work experience in analytics-related roles.",
          "Build personal projects and a portfolio to demonstrate practical ability.",
          "Keep learning continuously by following new trends in data analytics.",
          "Join online communities, forums, and conferences to grow professional knowledge and network.",
        ],
      },
      {
        title: "Further Development & Recommendations",
        bullets: [
          "Learn additional tools such as Tableau, Power BI, and Looker Studio to improve visualization effectiveness.",
          "Learn cloud platforms (AWS, Google Cloud Platform, Azure) for modern analytics workflows.",
          "Practice presentation and storytelling to communicate findings clearly and persuasively.",
          "Build a stronger network by joining analyst communities and sharing projects.",
          "Create personal projects regularly to strengthen practical skills and portfolio quality.",
          "Pursue certifications such as Google Data Analytics Professional Certificate and Microsoft Certified: Data Analyst Associate.",
        ],
      },
    ],
  },

  {
    id: "data-scientist",
    title: "Data Scientist",
    group: "Data",
    intro:
      "A Data Scientist is a specialist who applies statistics, machine learning, and data analysis to build models and generate deep insights. The role focuses on understanding data and using it to support business decision-making.",
    sections: [
      {
        title: "What Data Scientists do",
        bullets: [
          "Collect data from multiple sources and prepare it for analysis.",
          "Clean and improve data quality to ensure correctness and completeness.",
          "Analyze trends, patterns, and relationships using statistical techniques.",
          "Build and apply statistical and machine learning models for prediction and analysis.",
          "Develop and train ML models for forecasting and business decision support.",
          "Tune and optimize models to improve accuracy and efficiency.",
          "Create visualizations such as charts and dashboards using Tableau, Power BI, Matplotlib, and Seaborn.",
          "Test and evaluate models to ensure reliability and performance.",
          "Refine models based on feedback and evaluation results.",
          "Communicate findings and recommendations clearly to teams and stakeholders.",
          "Write reports and present technical insights in understandable formats.",
          "Collaborate with Data Engineers, Analysts, and development teams.",
          "Provide technical support for teams using data and models.",
        ],
      },
      {
        title: "Required Skills",
        bullets: [
          "Programming skills in Python, R, and SQL.",
          "Hands-on use of libraries such as pandas, NumPy, scikit-learn, TensorFlow, and PyTorch.",
          "Strong statistics and mathematics foundations for analysis and modeling.",
          "Experience training ML models with TensorFlow, Keras, and PyTorch.",
          "Ability to select ML techniques that fit the data and business problem.",
          "Data management and large-scale processing skills with Hadoop and Spark.",
          "Knowledge of SQL and NoSQL databases.",
          "Data visualization skills with Matplotlib, Seaborn, Tableau, and Power BI.",
          "Strong communication for reporting and presenting insights.",
          "Problem-solving and analytical thinking.",
        ],
      },
      {
        title: "Preparation & Career Growth",
        bullets: [
          "Complete a bachelor’s or master’s degree in Computer Science, Software Engineering, Statistics, Mathematics, or related fields.",
          "Use self-study and online courses focused on analytics and machine learning.",
          "Gain internship/work experience in data analysis or ML-related roles.",
          "Build personal projects and a portfolio to demonstrate practical skills.",
          "Keep learning continuously by following Data Science trends and technologies.",
          "Join online communities, forums, and conferences in analytics and AI.",
        ],
      },
      {
        title: "Further Development & Recommendations",
        bullets: [
          "Learn additional ML/AI tools such as TensorFlow, PyTorch, and Keras.",
          "Learn cloud platforms (AWS, Google Cloud Platform, Azure) for model development and deployment.",
          "Improve visualization techniques for clearer communication of insights.",
          "Strengthen presentation and storytelling skills for business audiences.",
          "Build professional networks through Data Science communities.",
          "Create personal projects regularly to improve ability and portfolio quality.",
          "Pursue certifications such as Google Data Analytics Professional Certificate and Microsoft Certified: Azure Data Scientist Associate.",
        ],
      },
    ],
  },

  {
    id: "data-engineer",
    title: "Data Engineer",
    group: "Data",
    intro:
      "A Data Engineer is a specialist who designs, develops, and manages infrastructure for storing, processing, and accessing data, with a focus on delivering high-quality data for analytics and decision-making.",
    sections: [
      {
        title: "What Data Engineers do",
        bullets: [
          "Design and develop data infrastructure such as databases, data warehouses, and data lakes.",
          "Use tools such as Hadoop, Spark, and NoSQL databases to manage large-scale data.",
          "Build and manage ETL pipelines from multiple data sources to keep data complete and ready for use.",
          "Use integration tools such as Apache NiFi, Talend, and Informatica.",
          "Develop and manage big data processing systems and distributed processing workflows.",
          "Set up monitoring systems to keep data platforms healthy and detect issues quickly.",
          "Use monitoring tools such as Prometheus, Grafana, and Nagios.",
          "Maintain data security, including access control and encryption practices.",
          "Collaborate with Data Scientists, Analysts, and other engineering teams to deliver reliable, usable datasets.",
          "Provide technical support to teams using data and platform tools.",
          "Optimize ETL pipelines, storage systems, and query/runtime performance.",
        ],
      },
      {
        title: "Required Skills",
        bullets: [
          "Programming skills in Python, Java, and/or Scala.",
          "Ability to write and maintain ETL pipeline code.",
          "Strong knowledge of relational and NoSQL databases with advanced SQL skills.",
          "Hands-on experience with systems such as PostgreSQL, MySQL, and MongoDB.",
          "ETL design and implementation experience with tools such as Airflow, Talend, and AWS Glue.",
          "Big data expertise with Hadoop, Spark, and Kafka.",
          "Understanding of distributed computing principles.",
          "Monitoring and maintenance skills with Prometheus, Grafana, and Nagios.",
          "Knowledge of data security, encryption, and access management.",
          "Strong communication and cross-team collaboration skills.",
        ],
      },
      {
        title: "Preparation & Career Growth",
        bullets: [
          "Complete a bachelor’s degree in Computer Science, Software Engineering, Information Systems, or related fields.",
          "Learn through self-study or online courses focused on data engineering and data management.",
          "Gain internship/work experience in data systems, software development, or analytics roles.",
          "Build personal projects and a portfolio to demonstrate practical capability.",
          "Keep learning continuously by following trends in data platform engineering.",
          "Join communities, forums, and conferences in data engineering.",
        ],
      },
      {
        title: "Further Development & Recommendations",
        bullets: [
          "Learn newer tools such as Kafka, Flink, and Druid for more efficient data workflows.",
          "Build cloud platform skills in AWS, Google Cloud Platform, and Azure.",
          "Improve data visualization understanding with tools like Tableau and Power BI.",
          "Strengthen data security skills, including encryption and permission management.",
          "Build professional networks through data engineering communities.",
          "Create personal projects regularly to strengthen practical ability and portfolio quality.",
          "Pursue certifications such as Google Cloud Professional Data Engineer and AWS Certified Big Data/Specialty credentials.",
        ],
      },
    ],
  },
];

export default careers;
