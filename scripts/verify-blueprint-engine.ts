/**
 * One-off, real-database verification for BlueprintEngineService, same
 * evidentiary rigor used for the guard-evaluation pipeline and RLS
 * earlier in this engagement: proves publishVersion() against the real
 * growhubs_v2_dev database — versionNumber increments correctly across
 * repeated publishes, the parent BlueprintDefinition flips to PUBLISHED
 * inside the same transaction, and the previously-published version's
 * row is never touched by a later publish (immutability). Cleans up
 * everything it inserts. Not part of the application; run once via
 * ts-node and discarded.
 */
import 'reflect-metadata';
import { AppDataSource } from '../src/data-source';
import { BlueprintEngineService } from '../src/builder/blueprint-engine.service';
import {
  BlueprintDefinition,
  BlueprintLifecycleState,
} from '../src/builder/entities/blueprint-definition.entity';
import { BlueprintVersion } from '../src/builder/entities/blueprint-version.entity';
import { randomUUID } from 'crypto';

async function main() {
  await AppDataSource.initialize();
  const service = new BlueprintEngineService(AppDataSource);
  const tenantId = randomUUID();
  let blueprintId: string | undefined;

  try {
    const definitionRepo = AppDataSource.getRepository(BlueprintDefinition);
    const definition = await definitionRepo.save(
      definitionRepo.create({
        tenantId,
        blueprintType: 'PAGE',
        name: 'verify-blueprint-engine test page',
        ownerRef: { kind: 'test-harness' },
      }),
    );
    blueprintId = definition.blueprintId;
    console.log('created BlueprintDefinition', blueprintId, 'lifecycleState=', definition.lifecycleState);
    if (definition.lifecycleState !== BlueprintLifecycleState.DRAFT) {
      throw new Error('expected fresh BlueprintDefinition to default to DRAFT');
    }

    const v1 = await service.publishVersion({
      blueprintId,
      schemaSnapshot: { nodes: ['hero'] },
      renderContract: { target: 'web' },
    });
    console.log('published v1, versionNumber=', v1.versionNumber);
    if (v1.versionNumber !== 1) throw new Error('expected first published version to be versionNumber=1');

    const afterV1 = await definitionRepo.findOneByOrFail({ blueprintId });
    if (afterV1.lifecycleState !== BlueprintLifecycleState.PUBLISHED) {
      throw new Error('expected BlueprintDefinition.lifecycleState to flip to PUBLISHED after publishVersion');
    }
    console.log('confirmed BlueprintDefinition.lifecycleState === PUBLISHED after v1');

    const v2 = await service.publishVersion({
      blueprintId,
      schemaSnapshot: { nodes: ['hero', 'footer'] },
      renderContract: { target: 'web' },
    });
    console.log('published v2, versionNumber=', v2.versionNumber);
    if (v2.versionNumber !== 2) throw new Error('expected second published version to be versionNumber=2');

    const versionRepo = AppDataSource.getRepository(BlueprintVersion);
    const v1Reloaded = await versionRepo.findOneByOrFail({ blueprintVersionId: v1.blueprintVersionId });
    if (JSON.stringify(v1Reloaded.schemaSnapshot) !== JSON.stringify({ nodes: ['hero'] })) {
      throw new Error('v1 schemaSnapshot was mutated by publishing v2 — immutability broken');
    }
    console.log('confirmed v1 row is untouched after publishing v2 (immutability holds)');

    console.log('ALL CHECKS PASSED');
  } finally {
    if (blueprintId) {
      await AppDataSource.getRepository(BlueprintVersion).delete({ blueprintId });
      await AppDataSource.getRepository(BlueprintDefinition).delete({ blueprintId });
      console.log('cleaned up test rows for blueprintId', blueprintId);
    }
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('VERIFICATION FAILED', err);
  process.exit(1);
});
