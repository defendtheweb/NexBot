--
-- Table structure for table `raw_logs`
--

CREATE TABLE IF NOT EXISTS `raw_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `action` int(1) NOT NULL,
  `user` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `channel` varchar(25) COLLATE utf8_unicode_ci NOT NULL,
  `log` text COLLATE utf8_unicode_ci NOT NULL,
  `time` int(10) NOT NULL,
  `removed` int(1) NOT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ;



--
-- Table structure for table `remember`
--

CREATE TABLE IF NOT EXISTS `remember` (
  `r_id` int(3) NOT NULL AUTO_INCREMENT,
  `nick` varchar(25) COLLATE utf8_unicode_ci NOT NULL,
  `message` text COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`r_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci ;



--
-- Table structure for table `user_stats`
--

CREATE TABLE IF NOT EXISTS `user_stats` (
  `user` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `lines` int(3) NOT NULL,
  `words` int(4) NOT NULL,
  `chars` int(5) NOT NULL,
  `time` int(10) NOT NULL,
  `ht_user` varchar(35) COLLATE utf8_unicode_ci NOT NULL,
  UNIQUE KEY `user` (`user`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
