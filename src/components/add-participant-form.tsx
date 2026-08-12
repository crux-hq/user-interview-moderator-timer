"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addParticipant } from "@/lib/actions";

export function AddParticipantForm({ studyId }: { studyId: string }) {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await addParticipant(studyId, name, notes);
        setName("");
        setNotes("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not add participant.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="participantName">Participant name</Label>
        <Input
          id="participantName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan Lee"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="participantNotes">Notes (optional)</Label>
        <Textarea
          id="participantNotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Segment, recruiting source, quirks…"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add participant"}
      </Button>
    </form>
  );
}
