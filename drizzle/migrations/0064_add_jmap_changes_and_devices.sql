CREATE TABLE `jmap_changes` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mailbox_id` text NOT NULL,
	`object_type` text NOT NULL,
	`object_id` text NOT NULL,
	`thread_id` text,
	`change` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `jmap_changes_mailbox_seq_idx` ON `jmap_changes` (`mailbox_id`,`seq`);
--> statement-breakpoint
CREATE TABLE `jmap_change_floor` (
	`id` integer PRIMARY KEY NOT NULL,
	`seq` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `jmap_change_floor` (`id`, `seq`) VALUES (1, 0);
--> statement-breakpoint
CREATE TRIGGER `jmap_changes_messages_ai` AFTER INSERT ON `messages`
WHEN NEW.mailbox_id IS NOT NULL BEGIN
	INSERT INTO jmap_changes (mailbox_id, object_type, object_id, thread_id, change)
	VALUES (NEW.mailbox_id, 'email', NEW.id, coalesce(NEW.thread_id, NEW.id), 'created');
END;
--> statement-breakpoint
CREATE TRIGGER `jmap_changes_messages_au` AFTER UPDATE ON `messages`
WHEN NEW.mailbox_id IS NOT NULL AND OLD.mailbox_id IS NEW.mailbox_id BEGIN
	INSERT INTO jmap_changes (mailbox_id, object_type, object_id, thread_id, change)
	VALUES (NEW.mailbox_id, 'email', NEW.id, coalesce(NEW.thread_id, NEW.id), 'updated');
END;
--> statement-breakpoint
CREATE TRIGGER `jmap_changes_messages_au_moved` AFTER UPDATE OF mailbox_id ON `messages`
WHEN OLD.mailbox_id IS NOT NEW.mailbox_id BEGIN
	INSERT INTO jmap_changes (mailbox_id, object_type, object_id, thread_id, change)
	SELECT OLD.mailbox_id, 'email', OLD.id, coalesce(OLD.thread_id, OLD.id), 'destroyed' WHERE OLD.mailbox_id IS NOT NULL;
	INSERT INTO jmap_changes (mailbox_id, object_type, object_id, thread_id, change)
	SELECT NEW.mailbox_id, 'email', NEW.id, coalesce(NEW.thread_id, NEW.id), 'created' WHERE NEW.mailbox_id IS NOT NULL;
END;
--> statement-breakpoint
CREATE TRIGGER `jmap_changes_messages_ad` AFTER DELETE ON `messages`
WHEN OLD.mailbox_id IS NOT NULL BEGIN
	INSERT INTO jmap_changes (mailbox_id, object_type, object_id, thread_id, change)
	VALUES (OLD.mailbox_id, 'email', OLD.id, coalesce(OLD.thread_id, OLD.id), 'destroyed');
END;
--> statement-breakpoint
CREATE TRIGGER `jmap_changes_folders_ai` AFTER INSERT ON `folders` BEGIN
	INSERT INTO jmap_changes (mailbox_id, object_type, object_id, change) VALUES (NEW.mailbox_id, 'mailbox', NEW.id, 'created');
END;
--> statement-breakpoint
CREATE TRIGGER `jmap_changes_folders_au` AFTER UPDATE ON `folders` BEGIN
	INSERT INTO jmap_changes (mailbox_id, object_type, object_id, change)
	SELECT OLD.mailbox_id, 'mailbox', OLD.id, 'destroyed' WHERE OLD.mailbox_id IS NOT NEW.mailbox_id;
	INSERT INTO jmap_changes (mailbox_id, object_type, object_id, change)
	VALUES (NEW.mailbox_id, 'mailbox', NEW.id, CASE WHEN OLD.mailbox_id IS NEW.mailbox_id THEN 'updated' ELSE 'created' END);
END;
--> statement-breakpoint
CREATE TRIGGER `jmap_changes_folders_ad` AFTER DELETE ON `folders` BEGIN
	INSERT INTO jmap_changes (mailbox_id, object_type, object_id, change) VALUES (OLD.mailbox_id, 'mailbox', OLD.id, 'destroyed');
END;
--> statement-breakpoint
CREATE TRIGGER `jmap_changes_mailboxes_au` AFTER UPDATE ON `mailboxes` BEGIN
	INSERT INTO jmap_changes (mailbox_id, object_type, object_id, change) VALUES (NEW.id, 'mailbox', NEW.id, 'updated');
END;
--> statement-breakpoint
CREATE TABLE `push_devices` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`api_key_id` text NOT NULL,
	`platform` text NOT NULL,
	`token` text NOT NULL,
	`environment` text DEFAULT 'production' NOT NULL,
	`topic` text NOT NULL,
	`public_key` text,
	`previews` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`api_key_id`) REFERENCES `api_keys`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `push_devices_platform_token_idx` ON `push_devices` (`platform`,`token`);
--> statement-breakpoint
CREATE INDEX `push_devices_user_idx` ON `push_devices` (`user_id`);
