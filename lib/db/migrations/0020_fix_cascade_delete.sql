ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_analysis_id_analyses_id_fk";
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_analysis_id_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."analyses"("id") ON DELETE cascade ON UPDATE no action;
