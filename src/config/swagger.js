
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kizuna Rail API',
            version: '1.0.0',
            description: 'API documentation for Kizuna Rail.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local development server',
            },
        ],
        components: {
            schemas: {
                Trip: {
                    type: 'object',
                    required: [
                        'id',
                        'name',
                        'description',
                        'region',
                        'startStation',
                        'endStation',
                        'duration',
                        'distance',
                        'highlights',
                        'bestSeason',
                        'operatingMonths',
                    ],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Unique identifier of the trip.',
                            example: 'alpine-panorama',
                        },
                        name: {
                            type: 'string',
                            example: 'Alpine Panorama Express',
                        },
                        description: {
                            type: 'string',
                            example: 'Journey through the Japanese Alps with stunning mountain views and traditional villages.',
                        },
                        region: {
                            type: 'string',
                            example: 'central',
                        },
                        startStation: {
                            type: 'string',
                            example: 'nagoya',
                        },
                        endStation: {
                            type: 'string',
                            example: 'toyama',
                        },
                        duration: {
                            type: 'string',
                            example: '4.5 hours',
                        },
                        distance: {
                            type: 'number',
                            minimum: 0,
                            example: 180,
                        },
                        highlights: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            example: [
                                'Mount Tateyama views',
                                'Hida River gorge',
                                'Traditional alpine villages',
                            ],
                        },
                        bestSeason: {
                            type: 'string',
                            example: 'autumn',
                        },
                        operatingMonths: {
                            type: 'array',
                            items: {
                                type: 'integer',
                                minimum: 1,
                                maximum: 12,
                            },
                            example: [4, 5, 6, 7, 8, 9, 10, 11],
                        },
                        imageUrl: {
                            type: 'string',
                            description: 'Optional image URL for the trip.',
                            example: '/images/routes/alpine-panorama.png',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            readOnly: true,
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            readOnly: true,
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
