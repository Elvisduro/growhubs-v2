/**
 * Seeds one real, published BlueprintDefinition/BlueprintVersion so the
 * web client (growhubs-v2-web) has something real to fetch and render
 * during its own build/verification — not a hardcoded mock on the client
 * side. Prints the blueprintId so the caller can wire it into the
 * client's config. Idempotent-ish: reuses a fixed, well-known id if it
 * already exists rather than growing duplicate demo rows on repeat runs.
 */
import 'reflect-metadata';
import { AppDataSource } from '../src/data-source';
import { BlueprintEngineService } from '../src/builder/blueprint-engine.service';
import { BlueprintDefinition } from '../src/builder/entities/blueprint-definition.entity';

const DEMO_BLUEPRINT_ID = '00000000-0000-4000-8000-000000000001';

async function main() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(BlueprintDefinition);
  let definition = await repo.findOneBy({ blueprintId: DEMO_BLUEPRINT_ID });
  if (!definition) {
    definition = repo.create({
      blueprintId: DEMO_BLUEPRINT_ID,
      tenantId: '00000000-0000-4000-8000-000000000002',
      blueprintType: 'PAGE',
      name: 'GrowHubs demo landing page',
      ownerRef: { kind: 'seed-script' },
    });
    await repo.save(definition);
    console.log('created demo BlueprintDefinition', definition.blueprintId);
  } else {
    console.log('reusing existing demo BlueprintDefinition', definition.blueprintId);
  }

  const service = new BlueprintEngineService(AppDataSource);
  const version = await service.publishVersion({
    blueprintId: DEMO_BLUEPRINT_ID,
    schemaSnapshot: {
      root: {
        type: 'stack',
        props: { direction: 'vertical' },
        children: [
          { type: 'heading', props: { text: 'Welcome to GrowHubs', level: 1 } },
          { type: 'text', props: { text: 'This page is rendered live from a published BlueprintVersion.' } },
          { type: 'button', props: { label: 'Get started', href: '/signup' } },
        ],
      },
    },
    renderContract: { target: 'web', themeTokenSet: 'default' },
  });
  console.log('published version', version.versionNumber, 'at', version.publishedAt);

  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
