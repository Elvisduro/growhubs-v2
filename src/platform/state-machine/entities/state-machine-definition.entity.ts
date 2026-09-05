import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * PLT-005 §2.1 — StateMachineDefinition: the versioned definition of one
 * lifecycle family (CORE-C1994). State/Event/Transition/Projection are kept
 * as distinct concepts (CORE-C1995) — never collapsed into one status
 * column. Terminal is NOT deletion (CORE-C1996).
 */
@Entity('state_machine_definitions')
@Index(['familyKey', 'version'], { unique: true })
export class StateMachineDefinition {
  @PrimaryGeneratedColumn('uuid', { name: 'machine_id' })
  machineId: string;

  /** one of the 22 families, e.g. "ORDER", "PAYMENT", "TORVET_PROJECTION" */
  @Column({ name: 'family_key' })
  familyKey: string;

  @Column({ default: 1 })
  version: number;

  /** the domain that owns mutation rights (CORE-C2000). */
  @Column({ name: 'owner_domain' })
  ownerDomain: string;

  @Column({ name: 'initial_state' })
  initialState: string;

  /** JSON array — terminal is NOT deletion (CORE-C1996). */
  @Column({ name: 'terminal_states', type: 'jsonb' })
  terminalStates: string[];

  /** which Subject/capability (per XD-008) may invoke which transition. */
  @Column({ name: 'actors_capabilities', type: 'jsonb', default: {} })
  actorsCapabilities: Record<string, unknown>;
}
