const User = require('../models/user_model');
const Branch = require('../models/branch_model');
const Job = require('../models/job_model');

const seedData = async () => {
  try {
    // Seed default admin user
    let adminUser;
    const existingAdmin = await User.findOne({ email: 'haseebzahid4998@gmail.com' });
    if (!existingAdmin) {
      adminUser = await User.create({
        name: 'Haseeb Zahid',
        email: 'haseebzahid4998@gmail.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '03184006367',
      });
      console.log('Default admin user created: haseebzahid4998@gmail.com');
    } else {
      adminUser = existingAdmin;
      console.log('Admin user already exists, skipping seed.');
    }

    // Seed default branches
    const defaultBranches = [
      { name: 'Islamabad', location: 'Islamabad, Pakistan' },
      { name: 'Lahore', location: 'Lahore, Pakistan' },
      { name: 'Karachi', location: 'Karachi, Pakistan' },
      { name: 'Remote', location: 'Remote / Work from Home' },
    ];

    for (const branch of defaultBranches) {
      const existingBranch = await Branch.findOne({ name: branch.name });
      if (!existingBranch) {
        await Branch.create(branch);
        console.log(`Branch created: ${branch.name}`);
      }
    }

    // Seed 9 IT/CS jobs (check by title to stay idempotent)
    const existingJobsCount = await Job.countDocuments({ postedBy: adminUser._id, isActive: true });
    if (existingJobsCount < 9) {
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + 2);

      const jobs = [
        {
          title: 'Full Stack Web Developer',
          description:
            'We are looking for an experienced Full Stack Web Developer to join our growing engineering team. You will be responsible for developing and maintaining web applications, collaborating with cross-functional teams, and delivering high-quality software solutions.\n\nYou will work on both client-side and server-side architecture, design RESTful APIs, and ensure the technical feasibility of UI/UX designs.',
          department: 'Software Engineering',
          branch: 'Islamabad',
          seats: 3,
          jobType: 'Full-time',
          experience: '2-3 years',
          salaryMin: 80000,
          salaryMax: 130000,
          requirements: [
            "Bachelor's degree in Computer Science or related field",
            'Proficiency in React.js, Node.js, and MongoDB',
            'Experience with RESTful API development',
            'Knowledge of Git version control',
            'Strong problem-solving skills',
          ],
          skills: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'JavaScript', 'Git', 'REST APIs'],
          deadline,
          postedBy: adminUser._id,
          isActive: true,
        },
        {
          title: 'Mobile App Developer (React Native)',
          description:
            'Join our mobile team to build cross-platform mobile applications using React Native. You will work closely with product managers and designers to deliver feature-rich, performant mobile experiences for both iOS and Android platforms.\n\nThe ideal candidate has a deep understanding of mobile UX principles and experience publishing apps to App Store and Google Play.',
          department: 'Mobile Development',
          branch: 'Lahore',
          seats: 2,
          jobType: 'Full-time',
          experience: '1-2 years',
          salaryMin: 70000,
          salaryMax: 110000,
          requirements: [
            "Bachelor's degree in Computer Science or Software Engineering",
            'Hands-on experience with React Native',
            'Familiarity with iOS and Android development',
            'Experience integrating third-party APIs',
            'Knowledge of state management (Redux / Context API)',
          ],
          skills: ['React Native', 'JavaScript', 'Redux', 'iOS', 'Android', 'REST APIs', 'Firebase'],
          deadline,
          postedBy: adminUser._id,
          isActive: true,
        },
        {
          title: 'DevOps Engineer',
          description:
            'We are seeking a skilled DevOps Engineer to help us build, maintain, and scale our cloud infrastructure. You will manage CI/CD pipelines, containerized workloads, and ensure high availability of production systems.\n\nYou will work closely with development teams to streamline deployments and improve system reliability.',
          department: 'Infrastructure & Operations',
          branch: 'Remote',
          seats: 2,
          jobType: 'Full-time',
          experience: '3-5 years',
          salaryMin: 120000,
          salaryMax: 180000,
          requirements: [
            "Bachelor's degree in Computer Science or related field",
            'Strong experience with AWS or Azure cloud services',
            'Proficiency with Docker and Kubernetes',
            'Experience setting up CI/CD pipelines (GitHub Actions, Jenkins)',
            'Knowledge of Linux system administration',
          ],
          skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform', 'GitHub Actions'],
          deadline,
          postedBy: adminUser._id,
          isActive: true,
        },
        {
          title: 'Cybersecurity Analyst',
          description:
            'We are hiring a Cybersecurity Analyst to protect our systems, networks, and data from cyber threats. You will conduct security assessments, monitor for intrusions, and implement security controls.\n\nThe ideal candidate is passionate about information security and stays current with evolving threat landscapes.',
          department: 'Information Security',
          branch: 'Islamabad',
          seats: 2,
          jobType: 'Full-time',
          experience: '2-3 years',
          salaryMin: 90000,
          salaryMax: 140000,
          requirements: [
            "Bachelor's degree in Cybersecurity, Computer Science, or IT",
            'Knowledge of SIEM tools and intrusion detection systems',
            'Experience with penetration testing and vulnerability assessments',
            'Familiarity with ISO 27001, NIST frameworks',
            'Security certifications (CEH, OSCP) preferred',
          ],
          skills: ['Network Security', 'Penetration Testing', 'SIEM', 'Vulnerability Assessment', 'Python', 'Firewall Management'],
          deadline,
          postedBy: adminUser._id,
          isActive: true,
        },
        {
          title: 'Data Scientist / ML Engineer',
          description:
            'We are looking for a talented Data Scientist to analyze complex datasets and build machine learning models that drive business decisions. You will work with large datasets, develop predictive models, and collaborate with engineering teams to deploy ML solutions to production.\n\nStrong statistical knowledge and proficiency in Python are essential.',
          department: 'Data & Analytics',
          branch: 'Karachi',
          seats: 2,
          jobType: 'Full-time',
          experience: '2-4 years',
          salaryMin: 100000,
          salaryMax: 160000,
          requirements: [
            "Bachelor's or Master's degree in Computer Science, Statistics, or Mathematics",
            'Proficiency in Python and data science libraries (NumPy, Pandas, Scikit-learn)',
            'Experience with machine learning frameworks (TensorFlow, PyTorch)',
            'Strong understanding of statistics and data modeling',
            'Experience with data visualization tools',
          ],
          skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Pandas', 'Data Visualization', 'Statistics'],
          deadline,
          postedBy: adminUser._id,
          isActive: true,
        },
        {
          title: 'UI/UX Designer',
          description:
            'We are looking for a creative UI/UX Designer to craft beautiful, user-centered digital experiences. You will be responsible for the entire design lifecycle — from wireframing and prototyping to delivering pixel-perfect UI designs.\n\nYou will collaborate closely with developers and product managers to bring your designs to life.',
          department: 'Product Design',
          branch: 'Lahore',
          seats: 2,
          jobType: 'Full-time',
          experience: '1-3 years',
          salaryMin: 65000,
          salaryMax: 100000,
          requirements: [
            "Bachelor's degree in Design, HCI, or related field",
            'Proficiency in Figma or Adobe XD',
            'Strong portfolio demonstrating UX process and visual design skills',
            'Experience with design systems and component libraries',
            'Understanding of web accessibility standards',
          ],
          skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'Wireframing', 'Design Systems', 'CSS'],
          deadline,
          postedBy: adminUser._id,
          isActive: true,
        },
        {
          title: 'Cloud Solutions Architect',
          description:
            'We are seeking an experienced Cloud Solutions Architect to design and implement scalable, secure cloud infrastructure for our products. You will work with stakeholders to translate business requirements into technical architecture and oversee the implementation of cloud-native solutions.\n\nThis is a senior role requiring deep expertise in cloud platforms and distributed systems.',
          department: 'Cloud & Infrastructure',
          branch: 'Remote',
          seats: 1,
          jobType: 'Full-time',
          experience: '5+ years',
          salaryMin: 180000,
          salaryMax: 250000,
          requirements: [
            "Bachelor's or Master's degree in Computer Science or related field",
            'Expert-level knowledge of AWS, Azure, or GCP',
            'Experience with microservices and serverless architectures',
            'Strong understanding of security best practices in the cloud',
            'Cloud certification (AWS Solutions Architect, Azure Solutions Expert) preferred',
          ],
          skills: ['AWS', 'Azure', 'GCP', 'Microservices', 'Serverless', 'Terraform', 'Security Architecture'],
          deadline,
          postedBy: adminUser._id,
          isActive: true,
        },
        {
          title: 'Backend Engineer (Python/Django)',
          description:
            'Join our backend team to build and scale robust server-side applications using Python and Django. You will design APIs, optimize database queries, and ensure our platform can handle millions of requests.\n\nThe ideal candidate is passionate about clean code, performance, and building systems that scale.',
          department: 'Software Engineering',
          branch: 'Karachi',
          seats: 3,
          jobType: 'Full-time',
          experience: '2-4 years',
          salaryMin: 85000,
          salaryMax: 135000,
          requirements: [
            "Bachelor's degree in Computer Science or related field",
            'Strong proficiency in Python and Django/Django REST Framework',
            'Experience with PostgreSQL or MySQL database design',
            'Knowledge of caching strategies (Redis, Memcached)',
            'Familiarity with containerization (Docker)',
          ],
          skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'REST APIs', 'Celery'],
          deadline,
          postedBy: adminUser._id,
          isActive: true,
        },
        {
          title: 'QA Engineer / Test Automation',
          description:
            'We are hiring a QA Engineer to ensure the quality of our software products through manual and automated testing. You will create test plans, write automated test scripts, and work closely with developers to identify and resolve defects early in the development cycle.\n\nExperience with modern test automation frameworks is required.',
          department: 'Quality Assurance',
          branch: 'Islamabad',
          seats: 2,
          jobType: 'Full-time',
          experience: '1-3 years',
          salaryMin: 60000,
          salaryMax: 95000,
          requirements: [
            "Bachelor's degree in Computer Science, Software Engineering, or related field",
            'Experience with test automation frameworks (Selenium, Cypress, Playwright)',
            'Knowledge of API testing tools (Postman, REST Assured)',
            'Strong understanding of SDLC and Agile methodologies',
            'Ability to write clear, comprehensive test documentation',
          ],
          skills: ['Selenium', 'Cypress', 'Jest', 'Postman', 'API Testing', 'Agile', 'Test Planning'],
          deadline,
          postedBy: adminUser._id,
          isActive: true,
        },
      ];

      for (const jobData of jobs) {
        const exists = await Job.findOne({ title: jobData.title, postedBy: adminUser._id });
        if (!exists) {
          await Job.create(jobData);
          console.log(`Job seeded: ${jobData.title}`);
        }
      }
    } else {
      console.log(`${existingJobsCount} active jobs already seeded, skipping.`);
    }

    console.log('Seed completed successfully.');
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = seedData;
