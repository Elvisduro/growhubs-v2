import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * ENGINEERING ADDITION (not itself a cited clause — an implementation
 * choice PLT-005 §13 explicitly leaves open): a generic current-state/
 * version tracker keyed by (objectType, objectId). PLT-005's own schema
 * assumes each domain's own table (Order, Payment, ...) holds its own
 * state+version columns; this table exists so the shared StateMachineEngine
 * can enforce the optimistic-concurrency contract (CORE-C1997/C1998) BEFORE
 * any individual domain module's own tables are built. A domain module may
 * either read its current state from here, or maintain its own state/
 * version column and pass it in as expectedVersion — both are valid; this
 * scaffold uses this table so the engine is testable standalone.
 */
@Entity('state_machine_object_state')
export class StateMachineObjectState {
  @PrimaryColumn({ name: 'object_type' })
  objectType: string;

  @PrimaryColumn({ name: 'object_id' })
  objectId: string;

  @Column({ name: 'machine_id', type: 'uuid' })
  machineId: string;

  @Column({ name: 'current_state' })
  currentState: string;

  @Column({ name: 'current_version', default: 0 })
  currentVersion: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
