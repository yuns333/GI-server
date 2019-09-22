/*this is DB for register and login and projects*/
/*DB name is giproject, user is tom71168, password is 1111*/
/*You have to create tables in giproject, projects and users*/

CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `projectname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `projectmanager` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `projecturl` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `projectname` (`projectname`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userid` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created` datetime NOT NULL,
  `modified` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userid` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci

