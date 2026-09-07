import { NextRequest, NextResponse } from "next/server";
import { handleError } from "../../../lib/error-handler";
import { EmissionService } from "../../../lib/services/emission.service";
import { CreateEmissionSchema } from "../../../lib/validation/schemas";

const emissionService = new EmissionService();

export async function GET() {
  try {
    const emissions = await emissionService.listEmissions();
    return NextResponse.json({ data: emissions });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateEmissionSchema.parse(body);
    const emission = await emissionService.createEmission(validated);
    return NextResponse.json(emission, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
